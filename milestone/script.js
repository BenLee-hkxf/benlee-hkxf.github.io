let svg, g, zoom;
let currentNode;
const radius = 200; // 子節點圍繞中心節點的半徑

function initMindMap() {
    svg = d3.select("#mind-map");
    g = svg.append("g");

    zoom = d3.zoom()
        .scaleExtent([0.1, 4])
        .on("zoom", (event) => g.attr("transform", event.transform));

    svg.call(zoom);

    d3.json("data.json").then(data => {
        currentNode = data;
        updateMindMap();
    });

    d3.select("#back-button").on("click", goBack);
    d3.select("#back-button").property("disabled", true);
}

function updateMindMap() {

    // 增加一個動畫效果:
    // 選取項目置中，然後放大 fade out
    // 載入的新項目 fade in 


    g.selectAll("*").remove();

    // // 淡出舊節點
    // g.selectAll("*")
    //     .transition()
    //     .duration(500)
    //     .style("opacity", 0)
    //     .remove();

    // 上面淡出效果可以，可是影響到子節點的產生

    
    const nodes = [currentNode, ...getVisibleChildren(currentNode)];
    const links = getVisibleChildren(currentNode).map(child => ({source: currentNode, target: child}));

    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(radius))
        .force("charge", d3.forceManyBody().strength(-1000))
        .force("center", d3.forceCenter(0, 0));

    simulation.tick(300); // Run the simulation for a fixed number of ticks

    const link = g.selectAll(".link")
        .data(links)
        .enter().append("line")
        .attr("class", "link")
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

    const node = g.selectAll(".node")
        .data(nodes)
        .enter().append("g")
        .attr("class", d => [
            "node", 
            d == currentNode?'root':d.children && d.children.length>0?'has-child':''].join(' '))
        .attr("transform", d => `translate(${d.x},${d.y})`)
        .on("click", clicked);

    node.append("circle")
        .attr("r", 10);

    node.append("text")
        .attr("dy", ".35em")
        .attr("x", 12)
        .text(d => d.name + `(${d.children ? d.children.length: 0})`);
    // ${JSON.stringify(d)}




    // Center the view
    const bounds = g.node().getBBox();
    const parent = svg.node().parentElement;
    const fullWidth = parent.clientWidth || parent.offsetWidth;
    const fullHeight = parent.clientHeight || parent.offsetHeight;
    const width = bounds.width;
    const height = bounds.height;
    const midX = bounds.x + width / 2;
    const midY = bounds.y + height / 2;
    if (width == 0 || height == 0) return; // nothing to fit
    const scale = 0.8 / Math.max(width / fullWidth, height / fullHeight);
    const translate = [fullWidth / 2 - scale * midX, fullHeight / 2 - scale * midY];

    svg.transition().duration(750)
       .call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));

    d3.select("#back-button").property("disabled", !currentNode.parent);
}

function getVisibleChildren(node) {
    return node.children || [];
}

function clicked(event, d) {
    // 分成中心點往上與周圍節點往下
    // is root / has-child


    if (d == currentNode){
        console.log(currentNode);
        goBack()

    } else if (d !== currentNode && (d.children || d._children)) {
        const last = currentNode;
        currentNode = d;
        currentNode.parent = last;
        updateMindMap();
    }
}

function goBack() {
    if (currentNode.parent) {
        currentNode = currentNode.parent;
        updateMindMap();
    }
}

window.onload = initMindMap;