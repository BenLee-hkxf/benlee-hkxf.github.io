
let nodeStat = {};

// 手動勾選 checkbox 會觸發兩個方向的遞迴更新，往下 children 與往上 parent
// 但是初始狀態沒有，所以要手動執行一次

function cacheAndRender(jsonNode) {
    nodeStat = jsonNode;

    initCheckBothStatus(nodeStat)
    console.log('nodeStat', nodeStat);
    renderTree()
}

function renderTree(){
    const wrapper = $('div#roadmap-wrapper').empty();
    const container = $('<div class="roadmap-container">').appendTo(wrapper);
    const ul = $('<ul>').appendTo(container);
    recursiveRenderNode(nodeStat,'').appendTo(ul);


    $('<textarea class="dark" rows="20" cols="50">').text(JSON.stringify(nodeStat)).appendTo(wrapper);
}

// 輸出 ul > li
function recursiveRenderNode(node, path){
   
    node.path = path;
    const li = renderNode(node);
    if (node.children){
        const ul = $('<ul class="children">').appendTo(li);
        node.children.map((child, i) => {
            child.parent = node;
            recursiveRenderNode(child, `${path}.${i}`).appendTo(ul);
        });
    }

    return li;
}

function renderNode(node) {
    const li = $('<li>');
    li.toggleClass('collapsed', !!node.collapsed);
    const el = $('<div class="node">').appendTo(li);

    const label = $('<label>').appendTo(el);

    createCollapseButton(node, li).appendTo(el);

    // // const toggler = $('<button>').text('toggle').appendTo(el);
    // const gridCollapsed = $(
    //     '<div class="grid-collapsed-row flex gap-1 items-center">'
    //   ).appendTo(el);

    // const toggler = $(
    //     '<span class="collapse-toggler cursor-pointer material-symbols-outlined"></span>'
    //   );
    
    // if (node.children && node.children.length > 0){
    //     toggler.appendTo(gridCollapsed);
    //     toggler.text("expand_circle_down");
    // }
    
    // gridCollapsed.on("click", function () {
    //     // node parent li
    //     el.parent().toggleClass("collapsed");
    //     // el.toggleClass("collapsed");
    // });

    const cb = $('<input type="checkbox">').attr('name', node.path).appendTo(label);

    // 有子項目
    //   狀態三選一：all-true, all-false, both
    // 無子項目
    //   依照自身狀態顯示


    if (node.children && node.children.length > 0){

        // indeterminate
        // const both = loopDetermineBoth(node.children);
        // const both = node.children.some((child) => child.checked) && node.children.some((child) => !child.checked);
        // console.log('node', node.title, both);


        if (node.both){
            cb.prop('indeterminate', true);
            node.checked = false;
        } else {
            const allChecked = node.children.every((child) => child.checked);
            cb.prop('checked', allChecked);
            // 如果是 true，把勾選狀態存起來
            if (allChecked){
                node.checked = true;
            } else {
                node.checked = false;
            }
        }
    }else{
        cb.prop('checked', node.checked)

    }



    const title = $('<span>').text(node.title).appendTo(label);

    // 異動之後，都要整個dom tree砍掉重新長，以免事件互相影響
    cb.on('change', function(){
        const checked = cb.prop('checked');

        // (

        if (node.children && node.children.length > 0){
            loopCheckAllChildren(node, checked);
        } else {
            node.checked = checked;
            loopCheckAllParent(node);
        }

        // if (node.parent){
        //     const parent = node.parent;
        //     parent.checked = parent.children.every((child) => child.checked);
        //     // $(`input`, parent.el).prop('checked', parent.checked);
        // }
        renderTree();
    });

    return li;
}


function createCollapseButton(node, li){
    
    // const toggler = $('<button>').text('toggle').appendTo(el);
    const gridCollapsed = $(
        '<div class="grid-collapsed-row flex gap-1 items-center">'
      );

    const toggler = $(
        '<span class="collapse-toggler cursor-pointer material-symbols-outlined"></span>'
      );
    
    if (node.children && node.children.length > 0){
        toggler.appendTo(gridCollapsed);
        toggler.text("expand_circle_down");
    }
    
    gridCollapsed.on("click", function () {
        // node parent li
        li.toggleClass("collapsed");
        node.collapsed = !node.collapsed;
        // el.toggleClass("collapsed");
    });

    return gridCollapsed;
}

function loopDetermineBoth(children){
    children.forEach((child) => {
        child._checked = child.children && child.children.length>0?loopDetermineBoth(child.children): child.checked;
    });
    return children.some((child) => child._checked) && children.some((child) => !child._checked);

}
function loopCheckAllChildren(node, checked){
    if (node.children ){
        node.children.forEach((child) => {
            child.checked = checked;
            loopCheckAllChildren(child, checked);
        });
    }
}
function loopCheckAllParent(node){
    
    if (node.parent){
        node.parent.checked = node.parent.children.every((child) => child.checked);
        loopCheckAllParent(node.parent);
    }
}


function initCheckBothStatus(node){
    // 把每一層級的 node 預先設定好 both 值
    // 如果有 children，往下遞迴檢查每一個 child 的 checked 狀態是否相同。如果不同，設定 both 為 true
    // 如果沒有 children，both 為 false


    

}


function checkBothStatus(children){
    children.forEach((child) => {
        child.both = checkBothStatus(child.children);
    });

    return children.some((child) => child.checked) && children.some((child) => !child.checked);

}


// function loopCheckStatus(children){
//     children.forEach((child) => {
//         child._checked = child.children && child.children.length>0?loopCheckStatus(child.children): child.checked;
//     });
//     return children.some((child) => child._checked) && children.some((child) => !child._checked);

// }

// function getBoth(){

// }

