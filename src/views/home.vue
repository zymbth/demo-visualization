<script setup>
const tools = [
  {
    title: 'ZRender',
    link: '',
    paragraphs: [
      'ZRender是一个轻量级的Canvas类库，是一个二维绘图引擎，它提供 Canvas、SVG、VML 多种渲染方式，并提供类 Dom 事件模型。同时，ZRender 也是 ECharts 的渲染器。',
      '使用ZRender并不复杂，我们需要引入相应的JavaScript文件，利用其所提供的API初始化一个Dom容器，在这个容器里绘制您所需要的图形。',
    ],
  },
  {
    title: 'Echarts',
    link: 'https://echarts.apache.org',
    paragraphs: [
      '如果需要做可视化方面的工作，那么你对Echarts一定不陌生。Echarts是百度开源的一个javaScript可视化图库，可以流畅地在PC 和移动设备上运行，兼容当前绝大部分浏览器，底层依赖矢量图形库ZRender，提供直观、交互丰富、可高度个性化定制的数据可视化图表。同时，Echarts的学习和使用也相对容易，通过几个简单的option配置项就可以很快地绘制出一个图表出来。',
    ],
  },
  {
    title: 'AntV',
    link: 'https://antv.antgroup.com/',
    paragraphs: [
      'AntV 是一个数据可视化项目，也是一个团队，即蚂蚁集团的数据可视化团队。AntV目前覆盖了统计图表、移动端图表、图可视化、地理可视化、2D绘图引擎和智能可视化等多个领域，主要包含 G2栈、F2栈、G6栈、X6栈、L7栈、AVA以及一套完整的图表使用和设计规范。',
    ],
  },
  {
    title: 'D3',
    link: 'https://d3js.org/',
    paragraphs: [
      'D3.js库是一个开源项目，作者是纽约时报的工程师。准确来说，D3.js实际是一个JavaScript函数库，不是图表库，比较适合于做数据可视化。D3有丰富的数学函数处理数据转换和物理计算，可以把数据和HTML 结构或者 SVG 文档对应起来，这种特性让我们可以更方便的操作DOM绘制图表。它可以说是“可视化界的jQuery”，因为D3的api和jQuery非常类似，可以看以下的例子：',
      "d3.select('#chart').selectAll('div').data([4, 16, 23, 42]).enter().append('div').style('height', (d)=> d + 'px')",
      '如果只是想绘制常见图表，倒是没必要直接用 D3，可以看看那些基于 D3 的图表库，比如Ploty.js、nivo等。',
    ],
  },
  {
    title: 'Vega',
    link: 'https://vega.github.io/',
    paragraphs: [
      '使用Vega不需要写前端代码，它做到了只需要 JSON 就能完成所有图表相关的开发，包括数据的加载、转换、交互等。由于Vega致力于通过一些JSON配置项实现图表的绘制，导致在生成一些基础简单的图表时，也需要很多行的配置。比如最简单的柱状图就需要95行配置，所以它提供了更简明的语法Vega-Lite，用于快速生成可视化以支持分析。',
    ],
  },
  {
    title: 'three.js',
    link: 'https://threejs.org/',
    paragraphs: [
      'three.js是一个基于WebGL的JavaScript 3D库，它使得在网页上创建和展示3D图形变得更加容易。它提供了丰富的API和工具，可以用于创建各种类型的3D场景，包括动画、交互式应用和游戏等。three.js还支持多种材质和灯光效果，可以让用户创建出逼真的3D场景。无论是初学者还是专业人士，都可以使用three.js来实现自己的3D创意。'
    ]
  }
]
</script>
<template>
  <div>
    <h1>前端数据可视化技术</h1>
    <h2>一、基础开发技术</h2>
    <h3>1、SVG</h3>
    <p>
      SVG是一种XML语言，类似XHTML，可以用来绘制矢量图形。SVG可以通过定义必要的线和形状来创建一个图形，也可以修改已有的位图，或者将这两种方式结合起来创建图形。
    </p>
    <h3>2、Canvas</h3>
    <p>
      Canvas API 提供了一个通过JavaScript 和
      HTML的元素来绘制图形的方式。它可以用于动画、游戏画面、数据可视化、图片编辑以及实时视频处理等领域。
    </p>
    <p>Canvas绘制的图形不会出现在DOM结构中，一般小画布、大数据量的场景适合用Canvas，性能更好。</p>
    <h3>3、WebGL</h3>
    <p>
      WebGL 使得在支持HTML 的 canvas 标签的浏览器中，不需要安装任何插件，便可以使用基于 OpenGL ES
      2.0 的 API 在 canvas
      中进行2D和3D渲染。如果您有一些3D绘制的需求，可以采用webGL方案。尤其是3d地图、3d地球等绘制都需要用到webGL技术。
    </p>
    <h2>二、可视化组件和工具</h2>
    <template v-for="(t, idx) in tools">
      <h3>
        {{ idx + 1 }}、{{ t.title }}
        <a v-if="t.link" :href="t.link" target="_blank"
          ><img class="svg-link" src="@/assets/link.svg"
        /></a>
      </h3>
      <p v-for="p in t.paragraphs">{{ p }}</p>
    </template>
    <h2>Tips</h2>
    <p>对于一般的图表可视化需求，推荐使用 echarts、g2。找到合适的模板，参考文档调整配置，可快速呈现。</p>
    <p>对于定制化程度很高的需求，推荐使用 d3.js</p>
  </div>
</template>
<style scoped>
.svg-link {
  vertical-align: middle;
  height: 1em;
  margin-left: 4px;
}
</style>
