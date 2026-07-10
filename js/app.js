let dashboardConfig;
let currentPageId = 'overview';
let adminMode = false;
let grid;

const gridElement = document.querySelector('.grid-stack');
const template = document.querySelector('#widget-template');
const adminToggle = document.querySelector('#admin-toggle');
const addWidgetButton = document.querySelector('#add-widget');
const saveLayoutButton = document.querySelector('#save-layout');

async function boot() {
  const response = await fetch('config/dashboard.json');
  dashboardConfig = await response.json();

  document.querySelector('#dashboard-title').textContent = dashboardConfig.dashboardTitle;
  document.querySelector('#dashboard-subtitle').textContent = dashboardConfig.subtitle;

  grid = GridStack.init({
    column: 12,
    cellHeight: 95,
    margin: 10,
    disableDrag: true,
    disableResize: true
  });

  bindNavigation();
  bindAdminButtons();
  renderPage(currentPageId);
  setInterval(updateClock, 1000);
  updateClock();
}

function bindNavigation() {
  document.querySelectorAll('.nav-item').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
      button.classList.add('active');
      currentPageId = button.dataset.page;
      renderPage(currentPageId);
    });
  });
}

function bindAdminButtons() {
  adminToggle.addEventListener('click', () => {
    adminMode = !adminMode;
    document.body.classList.toggle('admin-active', adminMode);
    grid.enableMove(adminMode);
    grid.enableResize(adminMode);
    addWidgetButton.disabled = !adminMode;
    saveLayoutButton.disabled = !adminMode;
    document.querySelector('#mode-status').textContent = adminMode ? 'Admin Mode: drag and resize enabled' : 'Operator View';
  });

  addWidgetButton.addEventListener('click', addDemoWidget);
  saveLayoutButton.addEventListener('click', saveLayoutToConsole);
}

function renderPage(pageId) {
  const page = dashboardConfig.pages.find(p => p.id === pageId) || dashboardConfig.pages[0];
  document.querySelector('#page-title').textContent = page.title;

  grid.removeAll();
  page.widgets.forEach(widget => grid.addWidget(createWidget(widget), widget));
  updateAlarmBanner(page.widgets);
}

function createWidget(widget) {
  const node = template.content.firstElementChild.cloneNode(true);
  node.dataset.widgetId = widget.id;

  node.querySelector('.widget-title').textContent = widget.title;
  node.querySelector('.widget-tag').textContent = widget.tag;
  node.querySelector('.status-dot').className = `status-dot ${widget.status || 'normal'}`;
  node.querySelector('.widget-value').textContent = `${widget.value}${widget.units ? ' ' + widget.units : ''}`;
  node.querySelector('.widget-footer').textContent = statusText(widget.status);

  const content = node.querySelector('.widget-card');

  if (widget.type === 'tank') {
    content.insertAdjacentHTML('beforeend', `
      <div class="tank-visual"><div class="tank-fill" style="height:${widget.percent || 0}%"></div></div>
    `);
  }

  if (widget.type === 'bar') {
    content.insertAdjacentHTML('beforeend', `
      <div class="bar-track"><div class="bar-fill" style="width:${widget.percent || 0}%"></div></div>
    `);
  }

  return node;
}

function statusText(status) {
  if (status === 'alarm') return 'Alarm - requires attention';
  if (status === 'warning') return 'Warning - monitor closely';
  if (status === 'offline') return 'Offline / no communication';
  return 'Normal operation';
}

function updateAlarmBanner(widgets) {
  const alarmWidgets = widgets.filter(w => w.status === 'alarm');
  const banner = document.querySelector('#alarm-banner');

  if (!alarmWidgets.length) {
    banner.className = 'alarm-banner normal';
    banner.innerHTML = '<strong>No Active Alarms</strong>';
    return;
  }

  banner.className = 'alarm-banner alarm';
  banner.innerHTML = `<strong>${alarmWidgets.length} Active Alarm${alarmWidgets.length > 1 ? 's' : ''}</strong>: ${alarmWidgets.map(w => w.title).join(', ')}`;
}

function addDemoWidget() {
  const id = `newWidget${Date.now()}`;
  const widget = {
    id,
    type: 'value',
    title: 'New Monitor',
    tag: 'New.Tag',
    value: '--',
    units: '',
    status: 'normal',
    x: 0,
    y: 0,
    w: 3,
    h: 2
  };

  const page = dashboardConfig.pages.find(p => p.id === currentPageId);
  page.widgets.push(widget);
  grid.addWidget(createWidget(widget), widget);
}

function saveLayoutToConsole() {
  const layout = grid.save(false);
  console.log('Saved layout:', layout);
  alert('Layout saved to browser console for now. Next step: save this to dashboard.json or local storage.');
}

function updateClock() {
  document.querySelector('#last-update').textContent = `Last update: ${new Date().toLocaleTimeString()}`;
}

boot().catch(error => {
  console.error(error);
  document.body.innerHTML = '<h1 style="padding:24px">Dashboard failed to load. Check the browser console.</h1>';
});
