
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
   
    // console.log('nodeStat', nodeStat);
    renderTree()
}

function renderTree(){
    const wrapper = $('div#roadmap-wrapper').empty();
    const container = $('<div class="roadmap-container">').appendTo(wrapper);
    const ul = $('<ul>').appendTo(container);
    recursiveRenderNode(nodeStat,'').appendTo(ul);

    // const jsonArea = $('.json-container textarea');
    // jsonArea.text(JSON.stringify(nodeStat))

    initFlowbite();
}


// 輸出 ul > li
function recursiveRenderNode(node, path){

    // 因為 parent 屬性會造成自我參照，改用獨立路徑物件 parentTree 來找 parent
   
    node.path = path;
    const li = renderNode(node);
    if (node.children && node.children.length > 0){
        const ul = $('<ul class="children">').appendTo(li);
        node.children.map((child, i) => {

            // if (child.path){
            //     parentTree[child.path] = node;
            // }
           
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


    const cb = $(
        '<input type="checkbox" class="node-checked">'
    ).attr({
        'name': node.path, 
        'data-path':node.path
    }).appendTo(label);

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

    return li;
}

function saveTree(){

    localStorage.setItem('roadmap', JSON.stringify(nodeStat));
    renderTree();
}

function loopRemovePath(node){
    delete node.path;
    if (node.children && node.children.length > 0){
        node.children.forEach((child) => {
            loopRemovePath(child);
        });
    } else {
        delete node.children;
    }
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
    
    const gridCollapsed = $(
        '<div class="grid-collapsed-row flex gap-1 items-center">'
      );

    const editButton = $(
        '<span class="opacity-10 hover:opacity-100 transition-opacity cursor-pointer node-btn node-act-btn node-act-edit material-symbols-outlined">edit</span>'
    ).attr({
        'data-path': node.path,
        'data-modal-target':'edit-modal', 
        'data-modal-toggle':'edit-modal'
    }).appendTo(gridCollapsed);

    //  data-modal-target="default-modal" data-modal-toggle="default-modal"
    
    const addButton = $(
        '<span class="opacity-10 hover:opacity-100 transition-opacity cursor-pointer node-btn node-act-btn node-act-add material-symbols-outlined">add_circle</span>'
      ).attr('data-path', node.path).appendTo(gridCollapsed);

    const removeButton = $(
        '<span class="text-rose-500 opacity-10 hover:opacity-100 transition-opacity cursor-pointer node-btn node-act-btn node-act-remove material-symbols-outlined">cancel</span>'
      ).attr('data-path', node.path).appendTo(gridCollapsed);



    const toggler = $(
        '<span class="collapse-toggler node-btn cursor-pointer material-symbols-outlined"></span>'
      );
    
    if (node.children && node.children.length > 0){
        toggler.appendTo(gridCollapsed);
        toggler.text("expand_circle_down");
    }else{
        // add empty placeholder
        $('<span class="w-[40px] node-btn material-symbols-outlined">').appendTo(gridCollapsed);
    }
    
    toggler.on("click", function () {
        li.toggleClass("collapsed");
        node.collapsed = !node.collapsed;
    });

    return gridCollapsed;
}

// 強制更新勾選狀態至所有子項目
function loopApplyChecked(node, checked){
    if (node.children ){
        node.children.forEach((child) => {
            child.cb = checked?1:0;
            loopApplyChecked(child, checked);
        });
    }
}


// 遞迴更新 parent 的勾選狀態
function loopDetermineParentChecked(node){

    if (parentTree[node.path]){
        const parent = parentTree[node.path];
        const children = parent.children;
        // 這邊以個小 bug，若 children 全都沒有 cb 屬性，第2個運算式會成立 => parent 變成部分選取
        parent.cb = children.every((child) => child.cb==1)?1: 
        children.some((child) => child.cb) && children.some((child) => child.cb != 0) ? 2 : 
            0;
        loopDetermineParentChecked(parent);
    }
}

const dropdownNodes = [];

function initTree(node){
    const jsonContainer = $('.json-container').empty();
    $('<textarea class="dark w-full" rows="20" >').appendTo(jsonContainer);

    // 由上而下，調整 both 與 checked 狀態
    loopChildrenStatus(node);

    return node;
}

function loopChildrenStatus(node){

    if (!node.children || node.children.length == 0){
        delete node.children;
        // 每一次走到底，往上更新所有父節點狀態
        loopDetermineParentChecked(node);
    } else {
        node.children.forEach((child, i) => {
            // 存檔時，path 會全部拿掉，初始化時，重新加回
            if (!child.path){
                child.path = [node.path, i].join('.');
            }
            if (child.path){
                parentTree[child.path] = node;
            }

            loopChildrenStatus(child);
        });
    }

}


// node-checked
// 異動之後，都要整個dom tree砍掉重新長，以免事件互相影響
$(document).on('change', 'input[type=checkbox].node-checked', function(){
    const cb = $(this);
    const node = loopFindNode(nodeStat, cb.attr('data-path'));
    const checked = cb.prop('checked');
    // console.log('checked changed', node.title, checked);
    node.cb = checked?1:0;

    loopApplyChecked(node, checked);
    loopDetermineParentChecked(node);

    saveTree();
});

$(document).on('click', '.btn-export-json', function(){
    const obj = JSON.parse(JSON.stringify(nodeStat));
    loopRemovePath(obj);
    const jsonArea = $('.json-container textarea');
    jsonArea.text(JSON.stringify(obj))

});

$(document).on('focus', 'input.node-name', function(){
    $(this).select();
});

$(document).on('click', '.editor-save-button', function(e){
    const path = $('.node-path').val();
    const title = $('.node-name').val();
    
    const node = loopFindNode(nodeStat, path);
    node.title = title;

    saveTree();
    $('.node-path').val('');

    // const modal = FlowbiteInstances.getInstance('Modal','edit-modal');
    // if (modal){
    //     modal.hide()
    // }
    // e.preventDefault();
});

$(document).on('click', '.node-act-edit', function(){
    // let modal = $('.edit-modal');
    // modal.toggleClass('hidden');    // modal.style.display = 'block';

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

    newNode.path = [path, targetNode.children.length-1].join('.');
    parentTree[newNode.path] = targetNode;
    loopDetermineParentChecked(newNode);
    saveTree();
});

$(document).on('click', '.btn-change-order', function(){
    const dir = $(this).attr('data-dir');
    const path = $('input[name=node-path]').val();
    const parent = parentTree[path];
    const currentIndex = parseInt(path.split('.').pop(), 10);
    const total = parent.children.length;
    let a = -1; b = -1;
    if (dir == 'up' && currentIndex > 0){
        a = currentIndex - 1;
        b = currentIndex;
    } else if (dir == 'down' && currentIndex < total-1){
        a = currentIndex;
        b = currentIndex+1;
    }
    if (a>=0&&b>=0){
        const temp = parent.children[a];
        parent.children[a] = parent.children[b];
        parent.children[b] = temp;
        saveTree();
        
        const modal = FlowbiteInstances.getInstance('Modal','edit-modal');
        if (modal){
            modal.hide()
        }
    }
    
});
$(document).on('click', '.btn-apply-move', function(){
    const path = $('input[name=node-path]').val();
    const target = $('input[name=move-path]').val();

    const node = loopFindNode(nodeStat, path);
    // const nodeIndex = parseInt(path.split('.').pop(), 10);
    const oldParent = parentTree[path];
    const newParent = loopFindNode(nodeStat, target);
   
    oldParent.children = oldParent.children.filter((child) => child.path !== path);
    newParent.children.push(node);

    const newPath = [...newParent.path.split('.'), newParent.children.length-1].join('.');
    node.path = newPath;
    delete parentTree[path];
    parentTree[newPath] = newParent;
    // parentTree[path] = newParent;

    saveTree();
    


    const modal = FlowbiteInstances.getInstance('Modal','edit-modal');
    if (modal){
        modal.hide()
    }
});

$(document).on('click', '.node-act-remove', function(){  
    const path = $(this).attr('data-path');
    
    const found = loopFindNode(nodeStat, path);
    if (found){
        if (found.children&&found.children.length>0 
            && !confirm(`請再次確認，刪除 "${found.title}" 及其下${found.children.length}個節點?`)){
            return;
        }
        const parent = parentTree[found.path];

        if (parent){
            const foundParent = loopFindNode(nodeStat, parent.path);
            if(foundParent){
                foundParent.children = foundParent.children.filter((child) => child.path !== path);

                // delete parentTree[path];

                // 移除之後，要從 sibling 角度查一次，更新 parent 的狀態
                if (foundParent.children.length > 0){
                    loopDetermineParentChecked(foundParent.children[0]);
                }else{
                    loopDetermineParentChecked(parent);
                }

                saveTree();
            }
        }
    }

    //parentTree[node.path].children = parentTree[node.path].children.filter((child) => child !== node);
  });

(function($){
    $(document).ready(function(){
        $(document.body).toggleClass('editor-mode', window.location.hash=='#editor-mode');
    
        // initFlowbite 時，如果 data-modal-target 的元素還沒加入，FlowBite 會報錯
        initFlowbite();
        //console.log(window.location.hash)
    })
})(jQuery);
