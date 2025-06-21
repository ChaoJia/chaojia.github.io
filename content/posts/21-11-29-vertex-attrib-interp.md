---
title: 'Vertex Attribute Interpolation and Analytical Derivatives'
description: 'vertex attribute interpolation and derivatives for visibility buffer rendering'
# summary: 'vertex attribute interpolation and derivatives for visibility buffer rendering' # For the post in lists.
date: 2021-11-29
lastmod: 2022-06-29
math: true
categories:
  - rendering
  - graphics
tags:
  - real-time rendering 
  - math
thumbnail: "/images/posts/2021-11-29/attr_interp_thumbnail.svg"
---

For visibility buffer rendering [^paper-2013] [^filmic-world-blog], we cannot rely on the hardware rasterization and built-in functions in fragment shader to do the vertex attribute interpolation and implicitly compute partial derivatives (i.e. `dFdx` and `dFdy` in _glsl_). This article describes the math behind a simple way to analytically compute these values, and provides formulas that can be easily translated to [shader code](https://gitlab.com/chao-jia/spock/-/blob/edc9e132e47c6696f2cc08002368224536107bbd/assets/glsl/basic_test/lighting_utils.h.glsl#L332) [^glsl-impl]. 
Although there are some existing implementations, they are [not quite satisfactory]({{< relref "#pitfalls-existing-implementations" >}}), which motivates me to do my own math.
<!--more-->

In general, we want to interpolate attributes (e.g. uv or normal) in a space before the perspective transform (object space, world space or camera space), as this is where these attributes are usually created. Therefore, in order to calculate the attributes of a pixel, we need to find the barycentric coordinates of the point in a pre-perspective space that is projected to that pixel. Because transform between pre-perspective spaces are affine transformations which preserve barycentric coordinates, without loss of generality, we can assume object space, world space and camera space are identical, and simply start with camera space.

## Notations {#notations}

First, some notations and conventions used throughout this article: 
* index $i \in \lbrace 0, 1, 2 \rbrace$; 
* $\textcolor{darkgoldenrod}{i \oplus k = (i + k) \mod 3}$; (__a bit unconventional__)
* $X^e, X^c, X^n$ represent $X$ in _camera (or eye) space_, _clip space_ and _screen space (with NDC)_ respectively; 
* NDC refers to _normalized device coordinates_ in screen space ([different coordinates](https://computergraphics.stackexchange.com/a/1771/7133)).

## Attribute interpolation {#attribute-interpolation}

Suppose there is a triangle $T^e$ (in camera space) with three vertices $V^e_i = (x^e_i, y^e_i, z^e_i, 1)$. After perspective projection by Matrix $\bm{P}$, $V^e_i$ is transformed to $V^c_i = (x^c_i, y^c_i, z^c_i, w_i) = \bm{P}\cdot V^e_i$ in clip space, and by applying perspective divide to $V^c_i$, we have the NDC $V^n_i = (x^n_i, y^n_i, z^n_i, 1) = V^c_i/w_i$ in screen space.

For a point $V^e = (x^e, y^e, z^e, 1)$ in triangle $T^e$ with the barycentric coordinates $\lambda^e_i$, namely $V^e = \sum \lambda^e_i V^e_i$, its coordinates in clip space: $V^c = (x^c, y^c, z^c, w) = \bm{P}\cdot V^e$, and NDC: $V^n = (x^n, y^n, z^n, 1) = V^c/w$. Assume the barycentric coordinates of $V^n$ in screen space are $\lambda^n_i$, that is, $V^n = \sum\lambda^n_iV^n_i$. Then we have
$$
\begin{align*}
V^n &= \sum\textcolor{orangered}{\lambda^n_i}V^n_i \\\\
    &= \frac{V^c}{w} = \frac{\bm{P}\cdot V^e}{w} = \frac{\bm{P}\sum \lambda^e_iV^e_i}{w} \\\\
    &= \sum\frac{\lambda^e_i}{w}(\bm{P}\cdot V^e_i) = \sum \frac{\lambda^e_i}{w}V^c_i \\\\
    &= \sum\textcolor{orangered}{\frac{\lambda^e_i}{w}w_i}V^n_i
\end{align*}
$$

Since the barycentric coordinates of $V^n$ are unique, we have 
$$
\begin{equation}
\lambda^e_i = \frac{w\lambda^n_i}{w_i}.
\end{equation}
$$
For a given pixel location, we can lookup the corresponding triangle data based on the triangle index stored in visibility buffer. It is straightforward to compute $w_i$ and $\lambda^n_i$ once the vertex positions are known alongside the transformation matrices and the resolution of the framebuffer. $\lambda^n_i$ can be computed as the ratio of the areas of 2D triangles (only $x$ and $y$ components of NDC are considered), which in turn are the determinants of the matrices formed by the 2D edge vectors of these 2D triangles:

$$
\begin{equation}
\lambda^n_i = \frac{1}{\mathcal{D}}\begin{vmatrix}
  x^n_{i \oplus 1} - x^n & x^n_{i \oplus 2} - x^n \\\\
  y^n_{i \oplus 1} - y^n & y^n_{i \oplus 2} - y^n
\end{vmatrix}
\end{equation}
$$

where $\mathcal{D}$ is _twice_ the area of the 2D triangle $\triangle V^n_0 V^n_1 V^n_2$, and can be calculated as 

$$
\begin{equation*}
\mathcal{D} = \begin{vmatrix}
  x^n_1 - x^n_0 & x^n_2 - x^n_0 \\\\
  y^n_1 - y^n_0 & y^n_2 - y^n_0
\end{vmatrix}
\end{equation*}
$$

{{< figure src="/images/posts/2021-11-29/attr_interp_01.svg" width="30%" class="center-figure" >}}

Due to the fact that **$1/w$ is linear in screen space** (see [a short proof]({{< relref "#proof-1-w-linear" >}}) below), we have
$$
\begin{equation}
\frac{1}{w} = \sum\displaystyle\lambda^n_i\frac{1}{w_i}.
\end{equation}
$$

By now we have all the ingredients needed to compute $\lambda^e_i$. It is worth noting that generally $\lambda^e_i \neq \lambda^n_i$, hence the necessity for [perspective correction](https://en.wikipedia.org/wiki/Texture_mapping#Perspective_correctness). Let $A_i$ be an attribute of vertex $V^e_i$, for point $V^e$, the interpolated attribute is $A = \sum\lambda^e_i A_i$, thus 
$$
\frac{A}{w} = \sum\frac{\lambda^e_i}{w}A_i \underbrace{=}_{\text{Eq. (1)}} \sum\frac{\lambda^n_i}{w_i}A_i.
$$

## Derivatives {#derivatives}

Clearly $A_i$ and $w_i$ are constant, so they don't vary along $x^n$-axis or $y^n$-axis, therefore we have

$$
\begin{equation}
\frac{\partial(A/w)}{\partial x^n} = \sum\frac{A_i}{w_i}\frac{\partial \lambda^n_i}{\partial x^n}.
\end{equation}
$$

So the partial derivative

$$
\begin{align*}
\frac{\partial A}{\partial x^n} 
  &= \frac{\partial (w \frac{A}{w})}{\partial x^n} \\\\
  &= \frac{\partial(\frac{1}{w})^{-1}}{\partial x^n}\frac{A}{w} + w\frac{\partial\frac{A}{w}}{\partial x^n} \\\\
  &= -\sum\frac{wA}{w_i}\frac{\partial \lambda^n_i}{\partial x^n} + \sum\frac{wA_i}{w_i}\frac{\partial \lambda^n_i}{\partial x^n}\hspace{2em}\Longleftarrow \textit{Eq. (3) and Eq. (4)} \\\\
  &= w\sum\left(\frac{A_i - A}{w_i}\frac{\partial \lambda^n_i}{\partial x^n}\right) \\\\
  &= \begin{bmatrix}
      \cdots & A_i - A & \cdots
     \end{bmatrix}
     \underbrace{\begin{bmatrix}
      \vdots \\\\ \frac{w}{w_i}\frac{\partial \lambda^n_i}{\partial x^n} \\\\ \vdots
     \end{bmatrix}}_{\bm{T}_x}.
\end{align*}
$$

Analogously, the partial derivative

$$
  \frac{\partial A}{\partial y^n} = 
    \begin{bmatrix}
      \cdots & A_i - A & \cdots
     \end{bmatrix}
     \underbrace{\begin{bmatrix}
      \vdots \\\\ \frac{w}{w_i}\frac{\partial \lambda^n_i}{\partial y^n} \\\\ \vdots
     \end{bmatrix}}_{\bm{T}_y}.
$$
 
Given Eq. (2), the last unknown pieces in $\bm{T}_x$ and $\bm{T}_y$ can be computed as

$$
\frac{\partial \lambda^n_i}{\partial x^n} = \frac{y^n_{i \oplus 1} - y^n_{i \oplus 2}}{\mathcal{D}},
$$
$$
\frac{\partial \lambda^n_i}{\partial y^n} = \frac{x^n_{i \oplus 2} - x^n_{i \oplus 1}}{\mathcal{D}}. 
$$

An advantage of this approach is that once the matrices $\bm{T_x}$ and $\bm{T_y}$ in the above equation is calculated, it can be used to compute screen-space partial derivatives of any attributes. . 

## Result {#result}

{{< img-cmp-slider 
  src-fg="/images/posts/2021-11-29/render_analytical.png"
  src-bg="/images/posts/2021-11-29/render_hardware.png" width-ratio="1" 
  title="Left: analytical derivatives; Right: hardware derivatives"
>}}

The image on the left is rendered with analytically calculated attributes and derivatives, which looks identical to the render using hardware-generated attributes and derivatives on the right. The subtle difference can be revealed by some statistics of per pixel difference (normalized):

Average  |  Median  | Maximum
:------: |  :----:  | :-----:
0.000050 | 0.000000 | 0.054902

{{< figure src="/images/posts/2021-11-29/duv_diff.png" width="100%" class="center-figure" >}}

<!-- ![Difference between hardware-generated and analytical derivatives of uv coordinates](/images/posts/2021-11-29/duv_diff.png) -->

The color in the image above shows the difference between analytically computed and hardware-generated derivatives of uv coordinates. The difference is calculated as $\Vert\frac{\partial(UV)}{\partial x^n} - \texttt{dFdx(UV)}\Vert + \Vert\frac{\partial(UV)}{\partial y^n} - \texttt{dFdy(UV)}\Vert$ , with hardware-generated derivatives in $\texttt{monospaced font}$. Other than a few sparse bright spots, the image is mostly black, meaning that the difference is mostly negligible, and the analytical derivatives are indeed very accurate and precise. 

## Pitfalls of some existing implementations {#pitfalls-existing-implementations}

The accompanying code of the original paper on visibility buffer rendering [^paper-2013] computed screen-space derivatives of uv coordinates by also computing the uv coordinates of the upper and right neighboring pixels. It tends to get more computationally intensive if we have more attributes apart from uv coordinates, such as world positions and normals. 

The DAIS paper [^dais-paper] only provided Eq. (4) $\frac{\partial (\lambda^n / w)}{\partial x^n}$ regarding attribute derivatives in its appendix, and the shader code for computing derivatives given in its extended version [^dais-extended] does not seem to take $\frac{\partial w}{\partial x^n}$ into consideration either. In my experiment, the texture LOD inferred from derivatives calculated this way is incorrect, especially for large triangles in screen space, the render becomes blurry. 

In rendering framework _The Forge_ [^the-forge], the derivatives are calculated in a similar fashion to the DAIS paper, but with some obscure tweaks added which do not seem mathematically sound to me.

## Proof of $1/w$ being linear in screen space {#proof-1-w-linear}

Same as above, $\bm{P}$ represents the perspective projection matrix [^rtr] [^persp-proj], and we have
$$\bm{P}\cdot V^e = 
\begin{bmatrix}
  \cdot & \cdot & \cdot  & \cdot   \\\\
  \cdot & \cdot & \cdot  & \cdot   \\\\
  0     &    0  & \alpha & \beta   \\\\
  0     &    0  & \gamma & 0
\end{bmatrix}
\begin{bmatrix}
x^e \\\\
y^e \\\\
z^e \\\\
1
\end{bmatrix} = 
\begin{bmatrix}
x^c \\\\
y^c \\\\
z^c \\\\
w
\end{bmatrix} = w
\begin{bmatrix}
x^n \\\\
y^n \\\\
z^n \\\\
1
\end{bmatrix}
.
$$
After some algebraic manipulation we have
$$
z^n = \frac{z^c}{w} = \frac{\alpha z^e + \beta}{w} = \frac{\alpha (w/\gamma) + \beta}{w} = \frac{\alpha}{\gamma} + \beta\textcolor{orangered}{\frac{1}{w}}.
$$
On the other hand,
$$
\begin{aligned}
z^n &= \sum\lambda^n_i z^n_i \\\\
    &= \sum\lambda^n_i \left(\frac{\alpha}{\gamma} + \beta\frac{1}{w_i}\right) \\\\
    &= (\frac{\alpha}{\gamma}\sum\lambda^n_i) + \beta\sum\lambda^n_i\frac{1}{w_i} \\\\
    &= \frac{\alpha}{\gamma} + \beta\textcolor{orangered}{\sum\lambda^n_i\frac{1}{w_i}}.\hspace{2em}\Longleftarrow \sum\lambda^n_i = 1
\end{aligned}
$$
Therefore
$$
\frac{1}{w} = \sum\lambda^n_i\frac{1}{w_i},
$$
which implies that $\frac{1}{w}$ is linear in screen space.

[^paper-2013]: Christopher A. Burns and Warren A. Hunt, _[The Visibility Buffer: A Cache-Friendly Approach to Deferred Shading](https://jcgt.org/published/0002/02/04/)_, Journal of Computer Graphics Techniques (JCGT), vol. 2, no. 2, 55-69, 2013

[^filmic-world-blog]: [Visibility Buffer Rendering with Material Graphs](http://filmicworlds.com/blog/visibility-buffer-rendering-with-material-graphs/)

[^glsl-impl]: My initial glsl implementation can be found [here](https://gitlab.com/chao-jia/spock/-/blob/edc9e132e47c6696f2cc08002368224536107bbd/assets/glsl/basic_test/lighting_utils.h.glsl#L332), and later I improved the readability a little bit ([refined code](https://gitlab.com/chao-jia/spock/-/blob/21e4d17588fe05bf3edc2620f3478107f4d53342/etc/glsl/basic_renderer/miscellaneous.hsl#L389))

[^dais-paper]: Christoph Schied and Carsten Dachsbacher. 2015. _[Deferred attribute interpolation for memory-efficient deferred shading](https://cg.ivd.kit.edu/publications/2015/dais/DAIS.pdf)_. In Proceedings of the 7th Conference on High-Performance Graphics (HPG '15). Association for Computing Machinery, New York, NY, USA, 43-49. https://doi.org/10.1145/2790060.2790066

[^dais-extended]: Part II Chapter 3, Listing 3.2 of the book  _GPU Pro 7: Advanced Rendering Techniques (1st ed.)_ by Engel, W. (Ed.). (2016). A K Peters/CRC Press. https://doi.org/10.1201/b21261

[^the-forge]: _[Attribute derivatives in rendering framework The Forge](https://github.com/ConfettiFX/The-Forge/blob/v1.50/Examples_3/Visibility_Buffer/src/Shaders/FSL/visibilityBuffer_shade.frag.fsl)_

[^rtr]: _Real Time Rendering, 4th Edition_: $\S$ 4.7.2 Perspective Projection

[^persp-proj]: _[The perspective projection matrix in Vulkan](https://vincent-p.github.io/posts/vulkan_perspective_matrix/)_
