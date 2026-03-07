---
title: 'Optimize CGAL 3D convex hull'
description: 'Optimize CGAL 3D convex hull'
# summary: 'Optimize CGAL 3D convex hull' # For the post in lists.
date: 2026-03-07
lastmod: 2026-03-07
math: true
categories:
  - geometry
  - graphics
tags:
  - c++
  - math
  - optimization
  - performance
thumbnail: "/images/posts/2026-03-07/quick-hull-0.svg"
---

[CGAL](https://doc.cgal.org/latest/Convex_hull_3/index.html#Chapter_3D_Convex_Hulls) has a very robust and performant 3D Quickhull implementation. Recently I wrote my own Quickhull implementation, and tried some optimization ideas that bring 5x - 10x speedup over the CGAL implementation when tested on point sets with size ranging from a few thousand to a few million.

Before diving into the details on the optimization I did, let's first take a quick look at how Quickhull works.
<!--more-->

## Overview of the Quickhull algorithm {#quickhull-overview}

[Quickhull](https://en.wikipedia.org/wiki/Quickhull) is a popular choice for 3D convex hull computation due to its efficiency. Given a point set, Quickhull proceeds as follows: first it finds an initial tetrahedron, with the positive side of each face pointing outwards, and the vertices of each face are counterclockwise ordered. Then the outside point set of each face will be populated with the remaining points that are on the positive side (i.e. outside) of that face. Faces with non-empty outside point set are stored in a pending face container.

In each iteration, Quickhull will draw one pending face from the container, find the farthest point in the outside point set of that pending face, and mark all faces that have this point on their positive side as visible. The edges separating visible and invisible faces are collected. These edges form a closed border ring. New faces will be created from these edges and the farthest point. Visible faces will be removed and their outside points will be redistributed to the newly added faces, which will then be put in the pending face container.

{{< figure src="/images/posts/2026-03-07/quick-hull-1.svg" width="30%" class="center-figure" >}}

As a simple example, let's take a look at the image above. We have 5 points $A, B, C, D, E$. The initial tetrahedron is created from $A, B, C$ and $D$, while $E$ is the only outside point of face $\triangle CBD$. Obviously $E$ is invisible to all faces other than $\triangle CBD$. So in the first iteration (which is also the last iteration), $E$ is the farthest point, and the visible set consists of only $\triangle CBD$. The three edges that form the border edge ring are $CB$, $BD$ and $DC$. As new faces are created from these three edges and point $E$, Quickhull terminates and the convex hull is found.

## CGAL Implementation and optimization opportunities {#cgal-quickhull-impl}
The Quickhull implementation in [CGAL](https://doc.cgal.org/latest/Convex_hull_3/index.html#Chapter_3D_Convex_Hulls) is very fast and works extremely well. But one thing caught my attention was that at most places `std::list` is used. `Triangulation_data_structure_2` is the data structure to store the intermediate result with neighborhood information for each face. The vertices and faces are stored in `CGAL::Compact_container`. Because it's impossible to specify where to put an element in a `Compact_container`, a `Compact_container` is essentially a list. 

One of the drawbacks of `list` is that it requires one heap allocation for each element. If done frequently, Heap allocation is going to be much more expensive than stack allocation due to additional bookkeeping. Moreover, generally speaking, `list` is a lot less cache friendly because its elements are scattered around the memory instead of contiguously stored. Every fetch instruction could potentially populate the cache line with irrelevant data. In a standard `list` implementation, each entry in the `list` needs two additional pointers, which is not exactly very efficient memory-wise (on a 64-bit OS, each pointer needs 8 bytes).

Of course for the Quickhull implementation, `list` is a reasonable choice given that any vertex or face could be removed when running Quickhull. But `list` provides more than what is needed: when removing an element from `list`, the order of the elements remained in the `list` is unchanged. When order doesn't matter, it is possible to use `vector` instead while keeping the operation of removing an arbitrary element from the `vector` at constant time complexity. The idea is, to remove $i$th element of a `vector v` with length `n`, we can simply swap `v[i]` and `v[n - 1]` and then remove the last element.

Now it's time to take a look at the details of CGAL Quickhull implementation and the optimization techniques I used.

### 0. Initialization {#cgal-quickhull-impl-0-init}
```c
// CGAL Quickhull init
std::list<Point_3> points(input_begin, input_end);
Triangulation_data_structure_2 tds(initial_tetrahedron);
points.remove(tds.vertices);
for (face in tds.faces)
  for (point in points)
    if (is_on_positive_side(face, point))
    {
      points.remove(point);
      // face.points is of type std::list<Point_3> 
      face.points.append(point);
    }
std::list<Face_handle> pending_facets;
for (face in tds.faces)
  if (!face.points.empty())
  {
    set_pending_flag(face);
    pending_facets.push_back(&face);
  }
```

One more feature I would like to have for convex hull is that the output should be indices into the input point set, which means I cannot remove points from the input point set because each face have to store the indices of the three points as its vertices. So I use a `vector<uint8_t>` to store flags of the vertices. Similarly, each face also has a `uint8_t` field for the flags. Faces are stored in a `vector`.

It's important to reserve enough space for faces because we would want to avoid copy operations incurred by reallocation. Four times the number of the input vertices seems to be good enough for me, even for a heavily tessellated sphere.

### 1. The loop {#cgal-quickhull-impl-1-loop}
```c
// CGAL Quickhull main loop
while (!pending_facets.empty())
{
  std::list<Point_3> vis_outside_set;
  Face_handle start = pending_facets.front();
  Point_3 farthest_pt_it = farthest_outside_point(start);
  start->points.erase(farthest_pt_it);
  std::list<Face_handle> visible_set;
  std::map<Vertex_handle, Edge> border_map;
  std::vector<Edge> edges;

  // find visible set, i.e. faces that have farthest_pt_it on their positive side
  // collect outside points
  // create border edge ring
  // create new faces from border edge ring
  // partition outside set
}
```

#### Face struct in my implementation {#face-struct-in-my-impl}
```cpp
// face_t in my implementation
struct face_t {
  std::array<uint32_t, 3> point_indices;
  // opposite to the corresponding point_index
  std::array<uint32_t, 3> neighbor_face_indices;
  std::vector<uint32_t> outside_point_indices;
  std::array<uint8_t, 3> in_neighbor_indices;
  uint8_t flags;
};
// for faces[f] and its neighbor with index g = faces[f].neighbor_face_indices[i],
// let k = f.in_neighbor_indices[i], then
// f == faces[g].neighbor_face_indices[k]
```

As mentioned earlier, removing a face from `std::vector<face_t>` is done by swapping that face with the last face in the vector and then shrink the size of the vector by 1. This will invalidate any reference to the last face. So I cannot have a `vector` of indices of pending faces. It would force me to to go over the container to update the indices of the faces that are relocated. But without such a container, how can I skip the non-pending faces (faces that have no outside points) in each iteration?

The trick is to store all the non-pending faces in front of the pending faces, and keep track of the index of the first pending face. To maintain this loop invariant, it's necessary to be able to swap two faces. There is a bit more to do than simply exchanging the content of two memory places. Each face has references to its three (and only three) neighbors. If one face is relocated, and thereby gets a different index, we need to update its neighbors about the index change. To make this process more efficient, I introduced a new member `face_t::in_neighbor_indices` to keep track of references to a face in its neighbor faces.

With the small inconveniences above addressed, there is nothing stopping me from replacing all the `list`s with `vector`s. Another easy optimization is to define all the `vector`s before entering the loop to avoid frequent construction and destruction of `vector`s. 

### 2. Find visible set {#cgal-quickhull-impl-find-visible-set}
```c
std::vector<Vertex_handle> vertices;
visible_set.push_back(start);
set_visited_flag(start);
vertices.push_back(start->vertices);
set_visited_flag(start->vertices);

for (vis_it = visible_set.begin(); vis_it != visible_set.end(); ++vis_it) {
  for (nf : vis_it->neighbor_faces) {
    int neighbor_idx = nf->get_neighbor_idx(vis_it);
    Edge shared_edge = get_shared_edge(nf, vis_it);
    // 0 <= neighbor_idx < 3;
    // vis_it is nf->neighbor_faces[neighbor_idx];
    // nf->vertices[neighbor_idx] is not in vis_it->vertices
    if (!is_visited_flag_set(nf)) {
      if (!is_on_negative_side(nf, farthest_pt_it)) {
        visible_set.push_back(nf);
        Vertex_handle vh = nf->vertices[neighbor_idx];
        if (!is_visited_flag_set(vh)) {
          vertices.push_back(vh);
          set_visited_flag(vh);
        }
      } // nf not visited
      else {
        set_border_flag(nf);
        set_border_flag(get_vertices(shared_edge));
        border_map.insert({ get_start_vertex(shared_edge), shared_edge });
      }
    }
    else if (is_border_flag_set(nf)) {
      set_border_flag(get_vertices(shared_edge));
    }
  } // loop over neighbor faces of vis_it
} // loop over visible_set

for (v in vertices)
{
  if (!is_border_flag_set(v))
    tds.delete_vertex(v);
  else
    unset_flags(v);
}
```

This step is barely affected by the switch from list to vector. As some faces are marked as visible, which will be removed later, so here we note down how many of them are pending and non-pending respectively.

### 3. Collect outside points {#cgal-quickhull-impl-collect-outside-points}
```c
for (f in visible_set)
{
  vis_outside_set.append(f.points);
  f.points.clear();
  if (is_pending_flag_set(f)) // is in pending_facets
    pending_facets.erase(f);
  unset_flags(f);
}
```

In this step, no need for me to remove `f` from `pending_facets` because I don't have such a container.

### 4. Create border edge ring {#cgal-quickhull-impl-create-border-edge-ring}
```c
it =border_map.begin();
Edge e = it->second;
edges.push_back(e);
unset_flags(it->first);
border_map.erase(it);
while(!border_map.empty())
{
  it = border_map.find(get_end_vertex(e));
  e = it->second;
  unset_flags(e.first);
  edges.push_back(e);
  border_map.erase(it);
}
```

### 5. Create new faces {#cgal-quickhull-impl-create-new-faces}
```c
int to_remove_face_count = visible_set.size() - edges.size();
// reuse visible_set for new faces
if (to_remove_face_count < 0) {
  for (int i = 0; i < -to_remove_face_count; ++i)
    visible_set.push_back(tds.create_face());
}
else {
  for (int i = 0; i < to_remove_face_count; ++i) {
    tds.delete_face(visible_set.back());
    visible_set.pop_back();
  }
}

for (edge in edges) {
  face next_f = create_face_from_edge_and_point(farthest_pt_it, edge);
  face nf = get_border_face(edge);
  set_adjacency(next_f, nf);
  set_adjacency(prev_f, next_f);
}
```

In this step, I need to use additional flags to indicate which faces are newly added and which faces will not be reused and should be removed at the end of current iteration.

### 6. Partition outside points {#cgal-quickhull-impl-partition-outside-points}
```c
for (f in visible_set) {
  for (p in vis_outside_set)
  {
    if (is_on_positive_side(f, p)) {
      f.points.append(p);
      vis_outside_set.remove(p);
    }
  }
  if (!f.points.empty()) {
    pending_facets.push_back(f);
    set_pending_flag(f);
  }
  else
      unset_pending_flag(f);
}
```

In this step, I need to again update the number of pending and non-pending faces. 

### 7. Additional step to relocate the misplaced faces {#my-impl-relocated-misplaced-faces}

This step is only required by my implementation. After last step, we can compute the new position of the first pending face (referred to as `new_pending_face_begin` in the following) should all non-pending faces were located before all pending faces.

But at this moment there might be some misplaced faces. (Most of) these misplaced faces are either replaced by new faces or marked as to be removed. I used two passes to relocate those misplaced faces.
In the first pass, the faces to be removed are also considered pending faces so that they will be relocated to the right side of the last non-pending face. Now we have two types of misplaced faces. Type A: non-pending face with index no less than `new_pending_face_begin` and type B: pending face with index smaller than `new_pending_face_begin`.

Apart from the `visible_set`, I also need to check the faces between the old first pending face (`pending_face_begin`) and `new_pending_face_begin` for potentially misplaced faces due to the change of the position of the first pending face. At the beginning of the first pass, the faces that are not touched by this iteration but still misplaced are pushed into a stack. Then I start to go over each face in the visible set and check if it is a different type of misplacement than the top of the stack, if so swap it with the top of the stack, and pop the top of the stack, otherwise push it to the stack. Although faces to be removed are treated like pending faces, but an additional `vector` is used to store the (new) indices of these faces, let's say the name of this `vector` is `removed_face_indices`.

By the end of the first pass, the stack should be empty, and all the non-pending faces should be located to the left of all the pending faces that start at `new_pending_face_begin`, because it is impossible that the faces in the stack are of the same type of misplacement, as that would mean the `new_pending_face_begin` should be wrong. In the second pass the faces to be removed (in `removed_face_indices`) will be relocated to the end of `faces` and eventually get removed by shrinking the size of `faces`.

Clearly the complexity of this additional step is linear to the size of the visible set in each iteration, so the overhead this approach entails should be negligible compared to the performance gain it could potentially bring. The performance test result also confirms that.