const container = document.getElementById('backImg');
const gridBox = document.querySelector('.grid-box');

// 模板配置数据
// 移除原有的TEMPLATES常量
let TEMPLATES = {};

// 创建单个下拉菜单
function createSelect(roles, type) {
    const select = document.createElement('select');
    select.className = `${type}-select`;

    // 默认空选项
    select.appendChild(new Option(''));

    // 填充角色选项
    roles.forEach(role => {
        select.appendChild(new Option(role));
    });
    return select;
}

// renderer.js 修改部分
// ================ 新增：优化DOM操作 ================
let gridItemTemplate = null; // 模板缓存

// 创建网格项（使用模板优化）
function createGridItem(templateName) {
    if (!TEMPLATES[templateName]) {
        console.error(`找不到模板: ${templateName}`);
        return document.createElement('div');
    }
    if (!gridItemTemplate) {
        const template = document.createElement('template');
        template.innerHTML = `
            <div class="squarer">
                <div class="controls">
                    <div class="select-row"></div>
                    <div class="input-container">
                        ${'<div class="input-single-row"><input type="text"></div>'.repeat(3)}
                    </div>
                </div>
            </div>
        `;
        gridItemTemplate = template;
    }

    const clone = gridItemTemplate.content.cloneNode(true);
    const selectRow = clone.querySelector('.select-row');

    // 动态填充下拉框
    TEMPLATES[templateName].factions.forEach(faction => {
        const select = createSelect(faction.roles, faction.type);
        selectRow.appendChild(select);
    });

    return clone;
}

// ================ 优化初始化函数 ================
function initGrid(templateName = '通用模板') {
    // 使用文档片段和分批加载
    gridBox.innerHTML = '';
    const fragment = document.createDocumentFragment();

    let count = 0;
    const batchSize = 4; // 每批创建4个元素

    function createBatch() {
        const start = performance.now();
        while (count < 16 && performance.now() - start < 16) { // 每帧不超过16ms
            fragment.appendChild(createGridItem(templateName));
            count++;
        }
        if (count < 16) {
            requestAnimationFrame(createBatch);
        } else {
            gridBox.appendChild(fragment);
            initNumberInputs();
        }
    }

    requestAnimationFrame(createBatch);
}

// ================ 重置确认功能 ================
// 添加确认对话框
const confirmDialog = document.createElement('div');
confirmDialog.innerHTML = `
    <div class="dialog-content">
        <h3>确认重置</h3>
        <p>确定要清除所有背景和输入内容吗？</p>
        <div class="dialog-buttons">
            <button id="confirm-btn" style="color: red;">确定重置</button>
            <button id="cancel-btn">取消</button>
        </div>
    </div>
`;
confirmDialog.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    display: none;
    z-index: 1000;
`;
document.body.appendChild(confirmDialog);

// 重置逻辑优化
window.electronAPI.onReset(() => {
    // 显示确认对话框
    confirmDialog.style.display = 'block';
});

document.getElementById('confirm-btn').addEventListener('click', () => {
    confirmDialog.style.display = 'none';
    performReset();
});

document.getElementById('cancel-btn').addEventListener('click', () => {
    confirmDialog.style.display = 'none';
});

// 优化后的重置函数
function performReset() {
    // 使用异步操作
    requestAnimationFrame(() => {
        // 清理旧元素
        gridBox.innerHTML = '';
        document.querySelectorAll('.input-item').forEach(el => el.remove());

        // 重新初始化
        container.removeAttribute('src');
        const currentTemplate = document.getElementById('template-select').value;
        initGrid(currentTemplate);
    });
}

// ================ 事件委托优化 ================
document.addEventListener('input', e => {
    if (e.target.matches('input')) {
        // 统一处理输入事件
    }
}, true);


// 监听模板切换
document.getElementById('template-select').addEventListener('change', (e) => {
    if (TEMPLATES[e.target.value]) {
        initGrid(e.target.value);
    }
});

// 初始化应用
// 在初始化时加载配置
window.electronAPI.getTemplates().then(config => {
    TEMPLATES = config;
    initGrid(); // 初始化网格
});


// 图片功能
window.electronAPI.setBackground((event, value) => {
    container.src = value;
});

// 新增初始化数字输入框逻辑
function initNumberInputs() {
    const createInputRow = (containerId, start) => {
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        for (let i = 0; i < 8; i++) {
            const number = start + i;
            const item = document.createElement('div');
            item.className = 'input-item';

            // 添加数字标签
            const label = document.createElement('span');
            label.className = 'number-label';
            label.textContent = number;

            // 创建输入框
            const input = document.createElement('input');
            input.type = 'text';

            item.appendChild(label);
            item.appendChild(input);
            container.appendChild(item);
        }
    };

    createInputRow('row1-8', 1);
    createInputRow('row9-16', 9);
}