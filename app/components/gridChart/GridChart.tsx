'use client'
import { useContainerWidth } from "react-grid-layout"
import ReactGridLayout from "react-grid-layout/legacy"

export default function GridChart() {

    const {width, containerRef, mounted} = useContainerWidth()

    const layout = [
    { i: "a", x: 0, y: 0, w: 1, h: 2, static: true },
    { i: "b", x: 1, y: 0, w: 3, h: 2, minW: 2, maxW: 4 },
    { i: "c", x: 4, y: 0, w: 1, h: 2 }
  ];

    return (
    <div ref={containerRef} className="w-full h-full">
     {mounted && (
        <ReactGridLayout
          layout={layout}
          width={width}
          cols={12}
          rowHeight={30}
        >
          <div key="a">a</div>
          <div key="b">b</div>
          <div key="c">c</div>
        </ReactGridLayout>
      )} 
    </div>

    )
}