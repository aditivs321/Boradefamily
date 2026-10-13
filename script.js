const STORAGE_KEYS = {
  family: 'boradeFamilyMembers',
  income: 'boradeIncome',
  expenses: 'boradeExpenses',
  items: 'boradeItems',
  savings: 'boradeSavings',
  theme: 'boradeTheme'
};

const defaultFamily = [
  { id: 1, name: 'Sunita Borade', role: 'Mother' },
  { id: 2, name: 'Rohit Borade', role: 'Father' },
  { id: 3, name: 'Aditi Borade', role: 'Daughter' }
];

const defaultIncome = [
  { id: 1, description: 'Monthly Salary', amount: 55000 },
  { id: 2, description: 'Side Business', amount: 8000 }
];

const defaultExpenses = [
  { id: 1, description: 'Groceries', amount: 6500, date: '2026-10-01' },
  { id: 2, description: 'School Fees', amount: 4200, date: '2026-10-05' },
  { id: 3, description: 'Electricity', amount: 2500, date: '2026-10-07' }
];

const defaultItems = [
  { id: 1, name: 'Rice Bags', quantity: 5, note: 'Kitchen stock' },
  { id: 2, name: 'Soap', quantity: 18, note: 'Bathroom supplies' },
  { id: 3, name: 'Water Filters', quantity: 2, note: 'Household essential' }
];

const defaultSavings = [
  { id: 1, title: 'Emergency Fund', target: 200000, saved: 95000 },
  { id: 2, title: 'Family Vacation', target: 120000, saved: 40000 },
  { id: 3, title: 'Home Upgrade', target: 300000, saved: 110000 }
];

function getSavedData(key, fallback) {
  const item = localStorage.getItem(key);
  if (!item) return fallback;

  try {
    return JSON.parse(item);
  } catch (error) {
    console.warn('Could not parse localStorage item:', key);
    return fallback;
  }
}

function saveData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

let familyMembers = getSavedData(STORAGE_KEYS.family, defaultFamily);
let incomeList = getSavedData(STORAGE_KEYS.income, defaultIncome);
let expenseList = getSavedData(STORAGE_KEYS.expenses, defaultExpenses);
let inventoryList = getSavedData(STORAGE_KEYS.items, defaultItems);
let savingsGoals = getSavedData(STORAGE_KEYS.savings, defaultSavings);

// Theme
let currentTheme = localStorage.getItem(STORAGE_KEYS.theme) || 'dark';

function applyTheme(theme){
  document.body.classList.toggle('dark', theme === 'dark');
  currentTheme = theme;
  localStorage.setItem(STORAGE_KEYS.theme, theme);
}

// Chart instance
let incomeExpenseChart = null;

function formatCurrency(value) {
  return '₹' + Number(value).toLocaleString('en-IN');
}

function renderFamilyMembers() {
  const list = document.getElementById('family-list');
  if (!list) return;

  list.innerHTML = familyMembers.map(member => `
    <div class="card animated">
      <h3>${member.name}</h3>
      <p>Role: <strong>${member.role}</strong></p>
      <button class="delete-btn" data-type="family" data-id="${member.id}">Delete</button>
    </div>
  `).join('');
}

function updatePreviewTotals(totalIncome, totalExpenses, balance){
  const pi = document.getElementById('preview-income');
  const pe = document.getElementById('preview-expenses');
  const pb = document.getElementById('preview-balance');
  if(pi) pi.textContent = Number(totalIncome).toLocaleString('en-IN');
  if(pe) pe.textContent = Number(totalExpenses).toLocaleString('en-IN');
  if(pb) pb.textContent = Number(balance).toLocaleString('en-IN');
}

function renderIncomeAndExpenses() {
  const totalIncome = incomeList.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalExpenses = expenseList.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const balance = totalIncome - totalExpenses;

  document.getElementById('total-income').textContent = formatCurrency(totalIncome);
  document.getElementById('total-expenses').textContent = formatCurrency(totalExpenses);
  document.getElementById('balance').textContent = formatCurrency(balance);

  updatePreviewTotals(totalIncome, totalExpenses, balance);
  renderChart(totalIncome, totalExpenses);

  const expenseListEl = document.getElementById('expenses-list');
  if (!expenseListEl) return;

  expenseListEl.innerHTML = expenseList.map(expense => `
    <li class="list-item">
      <div>
        <strong>${expense.description}</strong><br>
        ${expense.date || 'No date'} — ${formatCurrency(expense.amount)}
      </div>
      <button class="delete-btn" data-type="expense" data-id="${expense.id}">Delete</button>
    </li>
  `).join('');
}

function renderInventory() {
  const list = document.getElementById('items-list');
  if (!list) return;

  list.innerHTML = inventoryList.map(item => `
    <li class="list-item">
      <div>
        <strong>${item.name}</strong><br>
        Qty: ${item.quantity} ${item.note ? `• ${item.note}` : ''}
      </div>
      <button class="delete-btn" data-type="inventory" data-id="${item.id}">Delete</button>
    </li>
  `).join('');
}

function renderSavingsGoals() {
  const list = document.getElementById('savings-list');
  if (!list) return;

  list.innerHTML = savingsGoals.map(goal => {
    const percent = Math.min((goal.saved / goal.target) * 100, 100);
    return `
      <div class="card">
        <h3>${goal.title}</h3>
        <p>Saved: <strong>${formatCurrency(goal.saved)}</strong></p>
        <p>Target: <strong>${formatCurrency(goal.target)}</strong></p>
        <div class="progress-bar" aria-valuenow="${Math.round(percent)}">
          <div style="width: ${percent}%;"></div>
        </div>
        <span>${Math.round(percent)}% complete</span>
      </div>
    `;
  }).join('');
}

function addMember() {
  const nameInput = document.getElementById('member-name');
  const roleInput = document.getElementById('member-role');

  const name = nameInput.value.trim();
  const role = roleInput.value.trim();

  if (!name || !role) {
    alert('Please enter both member name and role.');
    return;
  }

  familyMembers.push({ id: Date.now(), name, role });
  saveData(STORAGE_KEYS.family, familyMembers);
  renderFamilyMembers();
  nameInput.value = '';
  roleInput.value = '';
}

function addIncome() {
  const descInput = document.getElementById('income-desc');
  const amountInput = document.getElementById('income-amount');

  const description = descInput.value.trim();
  const amount = Number(amountInput.value);

  if (!description || !amount || amount <= 0) {
    alert('Please enter a valid income source and amount.');
    return;
  }

  incomeList.push({ id: Date.now(), description, amount });
  saveData(STORAGE_KEYS.income, incomeList);
  renderIncomeAndExpenses();
  descInput.value = '';
  amountInput.value = '';
}

function addExpense() {
  const descInput = document.getElementById('expense-desc');
  const amountInput = document.getElementById('expense-amount');
  const dateInput = document.getElementById('expense-date');

  const description = descInput.value.trim();
  const amount = Number(amountInput.value);
  const date = dateInput.value;

  if (!description || !amount || amount <= 0) {
    alert('Please enter a valid expense description and amount.');
    return;
  }

  expenseList.push({ id: Date.now(), description, amount, date });
  saveData(STORAGE_KEYS.expenses, expenseList);
  renderIncomeAndExpenses();
  descInput.value = '';
  amountInput.value = '';
  dateInput.value = '';
}

function addInventoryItem() {
  const nameInput = document.getElementById('item-name');
  const qtyInput = document.getElementById('item-qty');
  const noteInput = document.getElementById('item-note');

  const name = nameInput.value.trim();
  const quantity = Number(qtyInput.value);
  const note = noteInput.value.trim();

  if (!name || !quantity || quantity <= 0) {
    alert('Please enter a valid item name and quantity.');
    return;
  }

  inventoryList.push({ id: Date.now(), name, quantity, note });
  saveData(STORAGE_KEYS.items, inventoryList);
  renderInventory();
  nameInput.value = '';
  qtyInput.value = '';
  noteInput.value = '';
}

function deleteItem(type, id) {
  if (type === 'family') {
    familyMembers = familyMembers.filter(item => item.id !== id);
    saveData(STORAGE_KEYS.family, familyMembers);
    renderFamilyMembers();
    return;
  }

  if (type === 'expense') {
    expenseList = expenseList.filter(item => item.id !== id);
    saveData(STORAGE_KEYS.expenses, expenseList);
    renderIncomeAndExpenses();
    return;
  }

  if (type === 'inventory') {
    inventoryList = inventoryList.filter(item => item.id !== id);
    saveData(STORAGE_KEYS.items, inventoryList);
    renderInventory();
    return;
  }
}

function setupEventListeners() {
  const elAddMember = document.getElementById('add-member');
  if(elAddMember) elAddMember.addEventListener('click', addMember);
  const elAddIncome = document.getElementById('add-income');
  if(elAddIncome) elAddIncome.addEventListener('click', addIncome);
  const elAddExpense = document.getElementById('add-expense');
  if(elAddExpense) elAddExpense.addEventListener('click', addExpense);
  const elAddItem = document.getElementById('add-item');
  if(elAddItem) elAddItem.addEventListener('click', addInventoryItem);

  document.addEventListener('click', function (event) {
    const target = event.target;
    if (target.classList && target.classList.contains('delete-btn')) {
      const type = target.dataset.type;
      const id = Number(target.dataset.id);
      deleteItem(type, id);
    }
  });

  const navToggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('main-nav');
  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  const themeToggle = document.getElementById('theme-toggle');
  if(themeToggle){
    themeToggle.addEventListener('click', function(){
      const newTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
      applyTheme(newTheme);
    });
  }
}

function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function renderChart(totalIncome = 0, totalExpenses = 0){
  const ctx = document.getElementById('income-expense-chart');
  if(!ctx) return;

  const themeIsDark = document.body.classList.contains('dark');
  const incomeColor = themeIsDark ? '#34d399' : '#16a34a';
  const expenseColor = themeIsDark ? '#ff7b7b' : '#ef4444';
  const gridColor = themeIsDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)';

  const data = {
    labels: ['Income','Expenses'],
    datasets: [{
      label: 'Amount',
      data: [totalIncome, totalExpenses],
      backgroundColor: [incomeColor, expenseColor],
      borderRadius: 8,
      barThickness: 18
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { grid:{ display:false } },
      y: { grid: { color: gridColor }, beginAtZero:true, ticks:{ callback: v => '₹' + v.toLocaleString('en-IN') } }
    },
    plugins: { legend:{ display:false } }
  };

  if(incomeExpenseChart){
    incomeExpenseChart.data = data;
    incomeExpenseChart.options = options;
    incomeExpenseChart.update();
    return;
  }

  incomeExpenseChart = new Chart(ctx.getContext('2d'), { type: 'bar', data, options });
}

function initApp() {
  applyTheme(currentTheme);
  renderFamilyMembers();
  renderIncomeAndExpenses();
  renderInventory();
  renderSavingsGoals();
  setupEventListeners();

  // Re-render chart after small delay to ensure canvas sized
  setTimeout(() => {
    const totalIncome = incomeList.reduce((s,i)=>s+Number(i.amount||0),0);
    const totalExpenses = expenseList.reduce((s,i)=>s+Number(i.amount||0),0);
    renderChart(totalIncome, totalExpenses);
  }, 250);
}

initApp();
