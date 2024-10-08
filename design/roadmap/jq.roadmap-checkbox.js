
let nodeStat = {};
const parentTree = {};

const cbStatus = ['none', 'all', 'some'];
// nodeStat[cb] => 0: none, 1: all, 2: some

// 手動勾選 checkbox 會觸發兩個方向的遞迴更新，往下 children 與往上 parent
// 但是初始狀態沒有，所以要手動執行一次

function cacheAndRender(jsonNode) {
    // check localStorage

    const cache = localStorage.getItem('roadmap');
    if (cache){
        if (confirm('found cached data, load it?')){
            jsonNode = JSON.parse(cache);            
        } else {
            // localStorage.removeItem('roadmap');
            localStorage.setItem('roadmap', JSON.stringify(jsonNode));
        }
    }else{
        localStorage.setItem('roadmap', JSON.stringify(jsonNode));
    }
    nodeStat = initTree(jsonNode);
   
    console.log('nodeStat', nodeStat);
    renderTree()
}

function renderTree(){
    const wrapper = $('div#roadmap-wrapper').empty();
    const container = $('<div class="roadmap-container">').appendTo(wrapper);
    const ul = $('<ul>').appendTo(container);
    recursiveRenderNode(nodeStat,'').appendTo(ul);

    const jsonContainer = $('.json-container').empty();

    $('<textarea class="dark w-full" rows="20" >').text(JSON.stringify(nodeStat)).appendTo(jsonContainer);
}


// 輸出 ul > li
function recursiveRenderNode(node, path){

    // 因為 parent 屬性會造成自我參照，改用獨立路徑物件 parentTree 來找 parent
   
    node.path = path;
    const li = renderNode(node);
    if (node.children){
        const ul = $('<ul class="children">').appendTo(li);
        node.children.map((child, i) => {
            //child.parent = node;
            if (child.path){
                parentTree[child.path] = node;
            }
           
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


    const cb = $('<input type="checkbox">').attr('name', node.path).appendTo(label);

    // 有子項目
    //   狀態三選一：all-true, all-false, both
    // 無子項目
    //   依照自身狀態顯示


    if (node.children && node.children.length > 0){


        // nodeStat[cb] => 0: none, 1: all, 2: some
        if (node.cb == 2){
            cb.prop('indeterminate', true);
        } else {
            cb.prop('checked', node.cb == 1);
        }

    }else{
        // cb.prop('checked', node.checked)
        cb.prop('checked', node.cb == 1)
    }



    const title = $('<span>').text(node.title).appendTo(label);

    // 異動之後，都要整個dom tree砍掉重新長，以免事件互相影響
    cb.on('change', function(){
        const checked = cb.prop('checked');
        console.log('checked changed', node.title, checked);
        // const some = cb.prop('indeterminate');

        // node.checked = checked;
        // node.cb = cb.prop('indeterminate')?2: cb.prop('checked')==1;
        node.cb = checked?1:0;

        loopCheckAllChildren(node, checked);
        loopCheckAllParent(node);

        saveTree();
    });

    return li;
}

function saveTree(){
    localStorage.setItem('roadmap', JSON.stringify(nodeStat));
    renderTree();
}



function loopFindNode(node, path){
    if (node.path == path){
        return node;
    } else if (node.children){
        for (let i = 0; i < node.children.length; i++){
            const child = node.children[i];
            const found = loopFindNode(child, path);
            if (found){
                return found;
            }
        }
        // return node.children.map((child) => loopFindNode(child, path));
    }
    return null;
}

$('.editor-cancel-button').on('click', function(){});

function createCollapseButton(node, li){
    
    // const toggler = $('<button>').text('toggle').appendTo(el);
    const gridCollapsed = $(
        '<div class="grid-collapsed-row flex gap-1 items-center">'
      );

    const editButton = $(
        '<span class="text-blue-500 opacity-10 hover:opacity-100 transition-opacity cursor-pointer node-act-btn node-act-edit material-symbols-outlined">edit</span>'
    ).attr({
        'data-path': node.path,
        'data-modal-target':'edit-modal', 
        'data-modal-toggle':'edit-modal'
    }).appendTo(gridCollapsed);

    //  data-modal-target="default-modal" data-modal-toggle="default-modal"
    
    const addButton = $(
        '<span class="text-lime-500 opacity-10 hover:opacity-100 transition-opacity cursor-pointer node-act-btn node-act-add material-symbols-outlined">add_circle</span>'
      ).attr('data-path', node.path).appendTo(gridCollapsed);

    const removeButton = $(
        '<span class="text-rose-500 opacity-10 hover:opacity-100 transition-opacity cursor-pointer node-act-btn node-act-remove material-symbols-outlined">cancel</span>'
      ).attr('data-path', node.path).appendTo(gridCollapsed);



    const toggler = $(
        '<span class="collapse-toggler node-act-btn cursor-pointer material-symbols-outlined"></span>'
      );
    
    if (node.children && node.children.length > 0){
        toggler.appendTo(gridCollapsed);
        toggler.text("expand_circle_down");
    }else{
        // add empty placeholder
        $('<span class="w-[40px] node-act-btn material-symbols-outlined">').appendTo(gridCollapsed);
    }
    
    toggler.on("click", function () {
        // node parent li
        li.toggleClass("collapsed");
        node.collapsed = !node.collapsed;
        // el.toggleClass("collapsed");
    });

    return gridCollapsed;
}


function loopCheckAllChildren(node, checked){
    if (node.children ){
        node.children.forEach((child) => {
            // child.checked = checked;
            // delete child.both;
            child.cb = checked?1:0;
            loopCheckAllChildren(child, checked);
        });
    }
}



function loopCheckAllParent(node){

    if (parentTree[node.path]){
        const parent = parentTree[node.path];
        const children = parent.children;
        // parent.checked = children.every((child) => child.checked);
        // parent.both = children && children.length>0? children.some((child) => child.checked) && children.some((child) => !child.checked) : false;
        parent.cb = children.every((child) => child.cb==1)?1: children.some((child) => child.cb != 0) ? 2 : 0;
        loopCheckAllParent(parent);
    }
}

// 首次 render 之前，先把每一層級的 node 預先設定好 both 值
function initTree(node){

    // 由上而下，調整 both 與 checked 狀態
    loopChildrenStatus(node);


        
    $('.editor-save-button').on('click', function(){
        const path = $('.node-path').val();
        const title = $('.node-name').val();
        
        const node = loopFindNode(nodeStat, path);
        node.title = title;

        saveTree();
        $('.node-path').val('');
    });

    return node;
}

function loopChildrenStatus(node){

    if (!node.children || node.children.length == 0){
        delete node.children;
        loopCheckAllParent(node);
    } else {
        node.children.forEach((child) => {

            loopChildrenStatus(child);
        });
    }

}

$(document).on('click', '.node-act-edit', function(){
    let modal = document.getElementById('edit-modal');
    // modal.style.display = 'block';

    const path = $(this).attr('data-path');
    const node = loopFindNode(nodeStat, path);

    $('.node-path').val(node.path);
    $('.node-name').val(node.title);
});

$(document).on('click', '.node-act-add', function(){
    const path = $(this).attr('data-path');

    const targetNode = loopFindNode(nodeStat, path);



    const newNode = {
        title: 'node '+ Math.ceil(Math.random()*100000000),
        cb: 0,
        children: []
    };
    if (targetNode.children){
        targetNode.children.push(newNode);
    } else {
        targetNode.children = [newNode];
    }

    newNode.path = path + '.' + targetNode.children.length;
    parentTree[newNode.path] = targetNode;
    loopCheckAllParent(newNode);
    saveTree();
});

$(document).on('click', '.node-act-remove', function(){  
    const path = $(this).attr('data-path');
    

    const found = loopFindNode(nodeStat, path);
    if (found){
        const parent = parentTree[found.path];

        if (parent){
            const foundParent = loopFindNode(nodeStat, parent.path);
            if(foundParent){
                foundParent.children = foundParent.children.filter((child) => child.path !== path);

                // delete parentTree[path];

                // 移除之後，要從 sibling 角度查一次，更新 parent 的狀態
                if (foundParent.children.length > 0){
                    loopCheckAllParent(foundParent.children[0]);
                }else{
                    loopCheckAllParent(parent);
                }

                saveTree();
            }
        }
    }

    //parentTree[node.path].children = parentTree[node.path].children.filter((child) => child !== node);
  });