"""Reconstruct a closed, photo-textured portrait from the approved front view.

The supplied image is not edited. Its silhouette supplies the mesh boundary;
anatomical depth fields supply the unseen volume. The front is orthographically projected
to preserve the reference's proportions. A rounded back closes every contour.
"""
from pathlib import Path
from collections import Counter, deque
import argparse, json, os, struct, subprocess, tempfile
import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'design/avatar-options/tina-gold-source.png'
parser = argparse.ArgumentParser()
parser.add_argument('--relaxed-surface', type=Path, help='Reuse a surface produced by relax-avatar-surface.py')
args = parser.parse_args()
image = Image.open(SOURCE).convert('RGBA')
alpha = np.asarray(image)[:, :, 3].astype(float) / 255
height, width = alpha.shape
step = 5
xs = np.arange(0, width, step, dtype=float)
ys = np.arange(0, height, step, dtype=float)
samples = alpha[ys.astype(int)[:, None], xs.astype(int)[None, :]]
# Ignore disconnected antialiasing specks outside the actual portrait.
inside = samples > .5
seen = np.zeros_like(inside)
components = []
for y, x in zip(*np.where(inside)):
    if seen[y, x]: continue
    queue = deque([(y, x)]); seen[y, x] = True; component = []
    while queue:
        row, col = queue.popleft(); component.append((row, col))
        for dy, dx in ((0, 1), (0, -1), (1, 0), (-1, 0)):
            a, b = row + dy, col + dx
            if 0 <= a < len(ys) and 0 <= b < len(xs) and inside[a, b] and not seen[a, b]:
                seen[a, b] = True; queue.append((a, b))
    components.append(component)
keep = np.zeros_like(inside)
for y, x in max(components, key=len): keep[y, x] = True
samples[(inside & ~keep)] = 0

points, lookup, faces = [], {}, []
def vertex(point):
    key = tuple(round(float(v), 5) for v in point[:2])
    if key not in lookup:
        lookup[key] = len(points); points.append(key)
    return lookup[key]

def clip_triangle(triangle):
    polygon = []
    for i, current in enumerate(triangle):
        previous = triangle[i - 1]
        cin, pin = current[2] > .5, previous[2] > .5
        if cin != pin:
            t = (.5 - previous[2]) / (current[2] - previous[2])
            polygon.append(previous + (current - previous) * t)
        if cin: polygon.append(current)
    if len(polygon) < 3: return
    indices = [vertex(p) for p in polygon]
    for i in range(1, len(indices) - 1):
        if len(set((indices[0], indices[i], indices[i + 1]))) == 3:
            # Image Y points down; reverse for outward-facing front normals.
            faces.append((indices[0], indices[i + 1], indices[i]))

for j in range(len(ys) - 1):
    for i in range(len(xs) - 1):
        if samples[j:j+2, i:i+2].max() <= .5: continue
        a = np.array([xs[i], ys[j], samples[j, i]])
        b = np.array([xs[i+1], ys[j], samples[j, i+1]])
        c = np.array([xs[i+1], ys[j+1], samples[j+1, i+1]])
        d = np.array([xs[i], ys[j+1], samples[j+1, i]])
        clip_triangle([a, b, c]); clip_triangle([a, c, d])

uv = np.asarray(points) / [width - 1, height - 1]
front_faces = np.asarray(faces, dtype=np.uint32)
edges = Counter(tuple(sorted((f[i], f[(i+1) % 3]))) for f in faces for i in range(3))
boundary_edges = np.asarray([edge for edge, count in edges.items() if count == 1])
boundary = sorted({int(v) for edge in boundary_edges for v in edge})
boundary_set = set(boundary)
distance = np.empty(len(uv))
for start in range(0, len(uv), 512):
    a = uv[boundary_edges[:,0]]; direction = uv[boundary_edges[:,1]] - a
    delta = uv[start:start+512,None] - a[None]
    fraction = np.clip(np.sum(delta*direction[None],axis=2)/np.sum(direction*direction,axis=1),0,1)
    nearest = delta-fraction[:,:,None]*direction[None]
    distance[start:start+512] = np.sqrt(np.min(np.sum(nearest*nearest,axis=2),axis=1))
rounding = np.sqrt(1 - np.exp(-distance / .040))
u, v = uv.T

def dome(cx, cy, rx, ry):
    return np.sqrt(np.maximum(0, 1 - ((u-cx)/rx)**2 - ((v-cy)/ry)**2))

# Forehead, cheeks and chin form one convex oval. Hair depth is continuous with
# the head, so turning never reveals the holes between the previous tube pieces.
depth = .24 + .64 * dome(.497, .535, .222, .239)

def wave(path, radii, base, rise):
    global depth
    best = np.zeros(len(uv))
    for index in range(len(path) - 1):
        a, b = np.array(path[index]), np.array(path[index+1])
        segment = b - a
        t = np.clip(((uv - a) @ segment) / (segment @ segment), 0, 1)
        r = radii[index] * (1-t) + radii[index+1] * t
        d = np.sqrt(np.sum((uv - (a + t[:, None]*segment))**2, axis=1)) / r
        cap = np.sqrt(np.maximum(0, 1-d*d))
        best = np.maximum(best, np.where(d < 1, base + rise*cap, .20))
    # Smooth maximum at the join; no visible hard intersection between parts.
    delta = np.maximum(.045 - np.abs(depth-best), 0) / .045
    depth = np.maximum(depth, best) + delta*delta*.045*.25

for side in (1, -1):
    def mirror(path): return [(x if side == 1 else 1-x, y) for x, y in path]
    wave(mirror([(.488,.216),(.423,.181),(.356,.208),(.287,.295),(.236,.374),(.185,.404)]),
         [.035,.064,.075,.074,.067,.052], .28, .30)
    wave(mirror([(.488,.294),(.421,.267),(.358,.309),(.322,.389),(.268,.457),(.188,.486)]),
         [.029,.056,.065,.069,.058,.029], .39, .33)
    wave(mirror([(.233,.489),(.180,.550),(.196,.597),(.221,.638),(.183,.711),(.249,.789),(.350,.826)]),
         [.048,.071,.066,.064,.072,.074,.048], .26, .31)
    # The supplied image defines the eye rims and bead shapes precisely.
    eye_x = .404 if side == 1 else .590
    depth += .035 * dome(eye_x, .518, .029, .049)
    bead_x = .272 if side == 1 else .718
    for cy, radius in ((.564,.023),(.608,.027),(.652,.028)):
        cap = dome(bead_x, cy, radius, radius*1.08)
        depth = np.where(cap > 0, np.maximum(depth,.43+cap*.16),depth)

front_z = depth * rounding
back_z = -(.28 + .30*dome(.5,.50,.40,.42)) * rounding
# Smooth the reconstructed depth, especially along the antialiased silhouette.
# Image colors/UVs remain untouched; this only removes geometric sampling ridges.
neighbor_edges = np.asarray(list(edges),dtype=int)
degree = np.bincount(neighbor_edges.ravel(),minlength=len(uv))
for surface in (front_z,back_z):
    for _ in range(12):
        summed = np.zeros(len(uv))
        np.add.at(summed,neighbor_edges[:,0],surface[neighbor_edges[:,1]])
        np.add.at(summed,neighbor_edges[:,1],surface[neighbor_edges[:,0]])
        average = summed/np.maximum(degree,1)
        surface[:] = surface*.55+average*.45
        surface[boundary] = 0
camera, focal, scale = 5.2, 3.58, 1.10
# Orthographic projection preserves the reference without folding the silhouette.
ndc = np.column_stack(((u-.5)*2*scale, (.5-v)*2*scale))
xy = ndc * camera / focal
front_positions = np.column_stack((xy, front_z))
positions = list(front_positions)
texcoords = list(np.column_stack((u, 1-v)))
back_index = {}
for index in range(len(uv)):
    if index in boundary_set:
        back_index[index] = index
    else:
        back_index[index] = len(positions)
        positions.append([*xy[index], back_z[index]])
        texcoords.append([u[index], 1-v[index]])
back_faces = np.array([[back_index[c], back_index[b], back_index[a]] for a,b,c in faces], dtype=np.uint32)
positions = np.asarray(positions, dtype=np.float32)
texcoords = np.asarray(texcoords, dtype=np.float32)
triangles = np.vstack((front_faces, back_faces))
# Uniform volumetric remeshing removes the pinched marching-triangle border.
# The reference stays untouched; only the closed geometry is regularized.
if args.relaxed_surface:
    relaxed = np.load(args.relaxed_surface)
    positions, triangles = relaxed['positions'], relaxed['triangles']
else:
    with tempfile.TemporaryDirectory(prefix='tina-surface-') as folder:
        source, result = Path(folder)/'input.npz', Path(folder)/'result.npz'
        np.savez(source, positions=positions, triangles=triangles)
        blender = os.environ.get('TINA_BLENDER', '/Applications/Blender.app/Contents/MacOS/Blender')
        subprocess.run([blender, '--background', '--factory-startup', '--python',
                        str(ROOT/'scripts/relax-avatar-surface.py'), '--', str(source), str(result)], check=True)
        relaxed = np.load(result)
        positions, triangles = relaxed['positions'], relaxed['triangles']
# Project the regularized surface back onto the unmodified approved portrait.
uv = np.column_stack((positions[:,0]/(2*scale*camera/focal)+.5,
                      .5-positions[:,1]/(2*scale*camera/focal)))
# Avoid transparent edge pixels when remeshing moves a vertex just outside the
# source silhouette. Nearest interior sampling preserves a clean gold rim.
interior = np.asarray(image.getchannel('A').filter(ImageFilter.MinFilter(7))) > 250
pixel = np.rint(uv*[width-1,height-1]).astype(int)
pixel[:,0] = np.clip(pixel[:,0],0,width-1); pixel[:,1] = np.clip(pixel[:,1],0,height-1)
invalid = np.where(~interior[pixel[:,1],pixel[:,0]])[0]
border = interior & ~(np.roll(interior,1,0)&np.roll(interior,-1,0)&np.roll(interior,1,1)&np.roll(interior,-1,1))
candidates = np.column_stack(np.where(border)[::-1])
for start in range(0,len(invalid),128):
    indices = invalid[start:start+128]
    delta = pixel[indices,None,:]-candidates[None,:,:]
    pixel[indices] = candidates[np.argmin(np.sum(delta*delta,axis=2),axis=1)]
    uv[indices] = pixel[indices]/[width-1,height-1]
texcoords = np.column_stack((uv[:,0],1-uv[:,1])).astype(np.float32)
# Keep photograph projection on the visible face; wrap the edge and entire rear
# in a matching champagne studio finish, independent of the viewer's lighting.
is_front = positions[triangles,2].mean(axis=1) >= .045
front_faces, back_faces = triangles[is_front], triangles[~is_front]
triangles = np.vstack((front_faces,back_faces))
normals = np.zeros_like(positions)
face_normals = np.cross(positions[triangles[:,1]]-positions[triangles[:,0]], positions[triangles[:,2]]-positions[triangles[:,0]])
for corner in range(3): np.add.at(normals, triangles[:,corner], face_normals)
normals /= np.maximum(np.linalg.norm(normals, axis=1, keepdims=True), 1e-10)
assert np.all(np.isfinite(normals)) and len(positions) < 65536
closed_edges = Counter(tuple(sorted((int(f[i]),int(f[(i+1)%3])))) for f in triangles for i in range(3))
assert all(count == 2 for count in closed_edges.values()), 'Mesh is not closed'
# Bake broad, smooth studio reflections into rear vertex colors. A color-matched
# band joins the photograph at the front edge, avoiding a grey material seam.
x,y,z = positions.T
nx,ny,nz = normals.T
reflection = .52 + .17*np.cos(nx*6.0+ny*2.5) + .12*np.sin(ny*7-nx*2)
reflection += .22*np.exp(-((nx+.48)/.22)**2) + .20*np.exp(-((ny-.62)/.26)**2)
reflection = np.clip(reflection,.16,1.)
stops = np.array([0.,.30,.52,.72,.90,1.])
palette = np.array([[.32,.25,.18],[.53,.43,.32],[.72,.60,.46],
                    [.87,.76,.59],[.99,.93,.80],[1.,.985,.92]])
rear_srgb = np.column_stack([np.interp(reflection,stops,palette[:,c]) for c in range(3)])
# Sample a neighborhood for side colors, rather than extending individual
# high-contrast edge pixels into long stripes across the side of the model.
rgba = np.asarray(image).astype(float)/255.
weighted = np.dstack((rgba[:,:,:3]*rgba[:,:,3:4],rgba[:,:,3]))
integral = np.pad(weighted,((1,0),(1,0),(0,0))).cumsum(0).cumsum(1)
px,py = pixel.T; radius=24
x0,x1=np.maximum(px-radius,0),np.minimum(px+radius+1,width)
y0,y1=np.maximum(py-radius,0),np.minimum(py+radius+1,height)
area=integral[y1,x1]-integral[y0,x1]-integral[y1,x0]+integral[y0,x0]
source_rgb=area[:,:3]/np.maximum(area[:,3:4],1e-6)
blend = np.clip((.30-z)/.48,0,1)
blend = blend*blend*(3-2*blend)
rear_srgb = source_rgb*(1-blend[:,None])+rear_srgb*blend[:,None]
# Diffuse any residual contour sampling noise along the continuous surface.
links = np.asarray(list(closed_edges),dtype=int)
degree = np.bincount(links.ravel(),minlength=len(positions))
for _ in range(24):
    summed=np.zeros_like(rear_srgb)
    np.add.at(summed,links[:,0],rear_srgb[links[:,1]])
    np.add.at(summed,links[:,1],rear_srgb[links[:,0]])
    rear_srgb=rear_srgb*.35+summed/degree[:,None]*.65
# glTF vertex colors are linear; WebGL converts them to display sRGB explicitly.
rear_colors = np.where(rear_srgb<=.04045,rear_srgb/12.92,((rear_srgb+.055)/1.055)**2.4).astype('<f4')
interleaved = np.column_stack((positions,normals,texcoords,rear_colors)).astype('<f4')
indices = triangles.flatten().astype('<u2')
assets = ROOT / 'public/assets'
(assets/'tina-avatar-reference-v2.bin').write_bytes(struct.pack('<4I',0x54494E42,len(positions),front_faces.size,indices.size)+interleaved.tobytes()+indices.tobytes())

# A portable GLB is also retained for editing/inspection outside the website.
blob = bytearray(); views = []; accessors = []
def add_view(data, target=None):
    while len(blob)%4: blob.append(0)
    offset=len(blob); blob.extend(data)
    view={'buffer':0,'byteOffset':offset,'byteLength':len(data)}
    if target: view['target']=target
    views.append(view); return len(views)-1
def accessor(array, component, kind, bounds=False):
    view=add_view(array.tobytes(),34963 if kind=='SCALAR' else 34962)
    item={'bufferView':view,'componentType':component,'count':len(array),'type':kind}
    if bounds: item.update(min=array.min(axis=0).tolist(),max=array.max(axis=0).tolist())
    accessors.append(item); return len(accessors)-1
p=accessor(positions,5126,'VEC3',True); n=accessor(normals,5126,'VEC3')
# A feathered photograph overlay covers the gold base. This removes a visible
# material boundary without stretching edge pixels onto the sides.
overlay_positions=(positions+normals*.0006).astype('<f4')
pf=accessor(overlay_positions,5126,'VEC3',True)
opacity=np.clip((positions[:,2]-.05)/.25,0,1)
opacity=opacity*opacity*(3-2*opacity)
overlay_color=np.column_stack((np.ones((len(positions),3)),opacity)).astype('<f4')
cfront=accessor(overlay_color,5126,'VEC4')
# glTF image convention uses downward V.
gltf_uv=texcoords.copy(); gltf_uv[:,1]=1-gltf_uv[:,1]
t=accessor(gltf_uv.astype('<f4'),5126,'VEC2')
c=accessor(rear_colors,5126,'VEC3')
f=accessor(front_faces.flatten().astype('<u2'),5123,'SCALAR')
b=accessor(triangles.flatten().astype('<u2'),5123,'SCALAR')
img=add_view(SOURCE.read_bytes())
document={'asset':{'version':'2.0','generator':'Tina reference-contour reconstruction'},'scene':0,'scenes':[{'nodes':[0]}],
 'nodes':[{'mesh':0,'name':'Tina — reference-matched champagne portrait'}],
 'meshes':[{'primitives':[{'attributes':{'POSITION':pf,'NORMAL':n,'TEXCOORD_0':t,'COLOR_0':cfront},'indices':f,'material':0},{'attributes':{'POSITION':p,'NORMAL':n,'COLOR_0':c},'indices':b,'material':1}]}],
 'materials':[{'name':'Approved photograph — feathered front color','alphaMode':'BLEND','extensions':{'KHR_materials_unlit':{}},'pbrMetallicRoughness':{'baseColorTexture':{'index':0},'metallicFactor':0,'roughnessFactor':.22}},
 {'name':'Continuous champagne side and back','extensions':{'KHR_materials_unlit':{}},'pbrMetallicRoughness':{'baseColorFactor':[1,1,1,1],'metallicFactor':0,'roughnessFactor':.20}}],
 'extensionsUsed':['KHR_materials_unlit'],'textures':[{'source':0,'sampler':0}],'samplers':[{'magFilter':9729,'minFilter':9987,'wrapS':33071,'wrapT':33071}],
 'images':[{'bufferView':img,'mimeType':'image/png'}],'buffers':[{'byteLength':len(blob)}],'bufferViews':views,'accessors':accessors}
js=json.dumps(document,separators=(',',':')).encode(); js+=b' '*((-len(js))%4); blob+=b'\0'*((-len(blob))%4)
total=12+8+len(js)+8+len(blob)
(assets/'tina-avatar-reference-v2.glb').write_bytes(struct.pack('<III',0x46546C67,2,total)+struct.pack('<II',len(js),0x4E4F534A)+js+struct.pack('<II',len(blob),0x004E4942)+blob)
report={'reference':str(SOURCE.relative_to(ROOT)),'vertices':len(positions),'triangles':len(triangles),'closed_manifold':True,'method':'Voxel-regularized closed surface with subdivision, photo-projected front and color-matched champagne rear', 'rear_color':'Baked smooth studio reflections, linear vertex colors, unlit material for consistent gold in external viewers','front_color':'Unmodified supplied reference image','unobserved_geometry':'Back and depth inferred from the single front image','runtime':'public/assets/tina-avatar-reference-v2.bin','portable_model':'public/assets/tina-avatar-reference-v2.glb'}
(ROOT/'design/avatar-options/tina-reference-model.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
