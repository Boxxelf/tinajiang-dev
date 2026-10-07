"""Reconstruct a closed, photo-textured portrait from the approved front view.

The supplied image is not edited. Its silhouette supplies the mesh boundary;
anatomical depth fields supply the unseen volume. The front is orthographically projected
to preserve the reference's proportions. A rounded back closes every contour.
"""
from pathlib import Path
from collections import Counter, deque
import json, struct
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'design/avatar-options/tina-gold-source.png'
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
normals = np.zeros_like(positions)
face_normals = np.cross(positions[triangles[:,1]]-positions[triangles[:,0]], positions[triangles[:,2]]-positions[triangles[:,0]])
for corner in range(3): np.add.at(normals, triangles[:,corner], face_normals)
normals /= np.maximum(np.linalg.norm(normals, axis=1, keepdims=True), 1e-10)
assert np.all(np.isfinite(normals)) and len(positions) < 65536
closed_edges = Counter(tuple(sorted((int(f[i]),int(f[(i+1)%3])))) for f in triangles for i in range(3))
assert all(count == 2 for count in closed_edges.values()), 'Mesh is not closed'
interleaved = np.column_stack((positions,normals,texcoords)).astype('<f4')
indices = triangles.flatten().astype('<u2')
assets = ROOT / 'public/assets'
(assets/'tina-avatar-reference.bin').write_bytes(struct.pack('<4I',0x54494E41,len(positions),front_faces.size,indices.size)+interleaved.tobytes()+indices.tobytes())

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
# glTF image convention uses downward V.
gltf_uv=texcoords.copy(); gltf_uv[:,1]=1-gltf_uv[:,1]
t=accessor(gltf_uv.astype('<f4'),5126,'VEC2')
f=accessor(front_faces.flatten().astype('<u2'),5123,'SCALAR')
b=accessor(back_faces.flatten().astype('<u2'),5123,'SCALAR')
img=add_view(SOURCE.read_bytes())
document={'asset':{'version':'2.0','generator':'Tina reference-contour reconstruction'},'scene':0,'scenes':[{'nodes':[0]}],
 'nodes':[{'mesh':0,'name':'Tina — reference-matched champagne portrait'}],
 'meshes':[{'primitives':[{'attributes':{'POSITION':p,'NORMAL':n,'TEXCOORD_0':t},'indices':f,'material':0},{'attributes':{'POSITION':p,'NORMAL':n},'indices':b,'material':1}]}],
 'materials':[{'name':'Approved photograph — exact front color','extensions':{'KHR_materials_unlit':{}},'pbrMetallicRoughness':{'baseColorTexture':{'index':0},'metallicFactor':0,'roughnessFactor':.22}},
 {'name':'Reconstructed champagne back','pbrMetallicRoughness':{'baseColorFactor':[.77,.61,.43,1],'metallicFactor':.78,'roughnessFactor':.20}}],
 'extensionsUsed':['KHR_materials_unlit'],'textures':[{'source':0,'sampler':0}],'samplers':[{'magFilter':9729,'minFilter':9987,'wrapS':33071,'wrapT':33071}],
 'images':[{'bufferView':img,'mimeType':'image/png'}],'buffers':[{'byteLength':len(blob)}],'bufferViews':views,'accessors':accessors}
js=json.dumps(document,separators=(',',':')).encode(); js+=b' '*((-len(js))%4); blob+=b'\0'*((-len(blob))%4)
total=12+8+len(js)+8+len(blob)
(assets/'tina-avatar-reference.glb').write_bytes(struct.pack('<III',0x46546C67,2,total)+struct.pack('<II',len(js),0x4E4F534A)+js+struct.pack('<II',len(blob),0x004E4942)+blob)
report={'reference':str(SOURCE.relative_to(ROOT)),'vertices':len(positions),'triangles':len(triangles),'closed_manifold':True,'method':'Reference-contour mesh with rounded anatomical depth, photo-projected front, and reconstructed closed back','front_color':'Unmodified supplied reference image','unobserved_geometry':'Back and depth inferred from the single front image','runtime':'public/assets/tina-avatar-reference.bin','portable_model':'public/assets/tina-avatar-reference.glb'}
(ROOT/'design/avatar-options/tina-reference-model.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
