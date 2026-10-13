const STORAGE_KEYS = {
  family: 'boradeFamilyMembers',
  income: 'boradeIncome',
  expenses: 'boradeExpenses',
  items: 'boradeItems',
  savings: 'boradeSavings'
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

function formatCurrency(value) {
  return '₹' + Number(value).toLocaleString('en-IN');
}

function renderFamilyMembers() {
  const list = document.getElementById('family-list');
  if (!list) return;

  list.innerHTML = familyMembers.map(member => `
    <div class="card">
      <h3>${member.name}</h3>
      <p>Role: <strong>${member.role}</strong></p>
      <button class="delete-btn" data-type="family" data-id="${member.id}">Delete</button>
    </div>
  `).join('');
}

function renderIncomeAndExpenses() {
  const totalIncome = incomeList.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalExpenses = expenseList.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const balance = totalIncome - totalExpenses;

  document.getElementById('total-income').textContent = formatCurrency(totalIncome);
  document.getElementById('total-expenses').textContent = formatCurrency(totalExpenses);
  document.getElementById('balance').textContent = formatCurrency(balance);

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
        <div class="progress-bar" style="background: #e9f5ee; border-radius: 999px; overflow: hidden; height: 12px; margin: 10px 0;">
          <div style="width: ${percent}%; background: var(--green-500); height: 100%; border-radius: inherit;"></div>
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
  }

  if (type === 'expense') {
    expenseList = expenseList.filter(item => item.id !== id);
    saveData(STORAGE_KEYS.expenses, expenseList);
    renderIncomeAndExpenses();
  }

  if (type === 'inventory') {
    inventoryList = inventoryList.filter(item => item.id !== id);
    saveData(STORAGE_KEYS.items, inventoryList);
    renderInventory();
  }
}

function setupEventListeners() {
  document.getElementById('add-member').addEventListener('click', addMember);
  document.getElementById('add-income').addEventListener('click', addIncome);
  document.getElementById('add-expense').addEventListener('click', addExpense);
  document.getElementById('add-item').addEventListener('click', addInventoryItem);

  document.addEventListener('click', function (event) {
    const target = event.target;
    if (target.classList.contains('delete-btn')) {
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
}

function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function initApp() {
  renderFamilyMembers();
  renderIncomeAndExpenses();
  renderInventory();
  renderSavingsGoals();
  setupEventListeners();
}

initApp();
