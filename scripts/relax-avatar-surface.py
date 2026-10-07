"""Blender-only surface regularization, called by build-avatar-model.py."""
import sys
import bpy
import numpy as np

source, destination = sys.argv[sys.argv.index('--') + 1:]
data = np.load(source)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
mesh = bpy.data.meshes.new('Continuous portrait surface')
mesh.from_pydata(data['positions'].tolist(), [], data['triangles'].tolist())
mesh.update()
obj = bpy.data.objects.new('Tina', mesh)
bpy.context.collection.objects.link(obj)
bpy.context.view_layer.objects.active = obj
obj.select_set(True)

# Resample the uneven silhouette triangles into uniform surface cells first.
remesh = obj.modifiers.new('Uniform rounded surface', 'REMESH')
remesh.mode = 'VOXEL'
remesh.voxel_size = .018
remesh.use_smooth_shade = True
bpy.ops.object.modifier_apply(modifier=remesh.name)
smooth = obj.modifiers.new('Remove border ridges', 'SMOOTH')
smooth.factor = .9
smooth.iterations = 14
bpy.ops.object.modifier_apply(modifier=smooth.name)
subdivision = obj.modifiers.new('Continuous curvature', 'SUBSURF')
subdivision.levels = 1
bpy.ops.object.modifier_apply(modifier=subdivision.name)
if len(obj.data.vertices) > 56000:
    decimate = obj.modifiers.new('Web mesh budget', 'DECIMATE')
    decimate.ratio = 50000 / len(obj.data.vertices)
    bpy.ops.object.modifier_apply(modifier=decimate.name)
for polygon in obj.data.polygons:
    polygon.use_smooth = True
obj.data.update()
obj.data.calc_loop_triangles()
positions = np.array([v.co[:] for v in obj.data.vertices], dtype=np.float32)
triangles = np.array([t.vertices[:] for t in obj.data.loop_triangles], dtype=np.uint32)
np.savez(destination, positions=positions, triangles=triangles)
print('Regularized portrait:', len(positions), 'vertices,', len(triangles), 'triangles')
