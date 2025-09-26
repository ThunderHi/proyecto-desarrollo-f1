// Datos de ejemplo para demostración
let transactions = [
    {
        id: 1,
        description: "Pago de nómina",
        amount: 2500.00,
        type: "income",
        category: "salario",
        date: "2025-08-10"
    },
    {
        id: 2,
        description: "Pago de pensión",
        amount: 700.00,
        type: "expense",
        category: "servicios",
        date: "2025-08-20"
    },
    {
        id: 3,
        description: "Supermercado",
        amount: 150.75,
        type: "expense",
        category: "comida",
        date: "2025-09-20"
    },
    {
        id: 4,
        description: "Taxi",
        amount: 12.50,
        type: "expense",
        category: "transporte",
        date: "2025-09-21"
    }
];

// Elementos del DOM
const transactionForm = document.getElementById('transaction-form');
const transactionsContainer = document.getElementById('transactions-container');
const totalBalanceElement = document.getElementById('total-balance');
const totalIncomeElement = document.getElementById('total-income');
const totalExpensesElement = document.getElementById('total-expenses');
const savingsElement = document.getElementById('savings');
const filterButtons = {
    all: document.getElementById('filter-all'),
    income: document.getElementById('filter-income'),
    expense: document.getElementById('filter-expense')
};

// Inicializar gráfico
let financeChart;
const ctx = document.getElementById('finance-chart').getContext('2d');

// Función para formatear moneda
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN'
    }).format(amount);
}

// Función para calcular resumen financiero
function calculateSummary() {
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalBalance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? ((totalBalance / totalIncome) * 100).toFixed(1) : 0;

    totalIncomeElement.textContent = formatCurrency(totalIncome);
    totalExpensesElement.textContent = formatCurrency(totalExpenses);
    totalBalanceElement.textContent = formatCurrency(totalBalance);
    savingsElement.textContent = `${savingsRate}%`;

    updateChart();
}

// Función para renderizar transacciones
function renderTransactions(filter = 'all') {
    transactionsContainer.innerHTML = '';

    let filteredTransactions = transactions;
    if (filter !== 'all') {
        filteredTransactions = transactions.filter(t => t.type === filter);
    }

    if (filteredTransactions.length === 0) {
        transactionsContainer.innerHTML = '<p class="text-center text-muted">No hay transacciones para mostrar</p>';
        return;
    }

    filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(transaction => {
        const transactionElement = document.createElement('div');
        transactionElement.className = `d-flex justify-content-between align-items-center p-3 mb-2 rounded ${transaction.type === 'income' ? 'income bg-light' : 'expense bg-light'}`;

        transactionElement.innerHTML = `
                    <div>
                        <h6 class="mb-1">${transaction.description}</h6>
                        <small class="text-muted">${new Date(transaction.date).toLocaleDateString()} • ${transaction.category}</small>
                    </div>
                    <div class="text-end">
                        <span class="d-block fw-bold ${transaction.type === 'income' ? 'text-success' : 'text-danger'}">
                            ${transaction.type === 'income' ? '+' : '-'}${formatCurrency(transaction.amount)}
                        </span>
                        <small class="text-muted">${transaction.type === 'income' ? 'Ingreso' : 'Gasto'}</small>
                    </div>
                `;

        transactionsContainer.appendChild(transactionElement);
    });
}

// Función para actualizar el gráfico
function updateChart() {
    if (financeChart) {
        financeChart.destroy();
    }

    // Agrupar transacciones por mes
    const monthlyData = {};
    transactions.forEach(transaction => {
        const month = transaction.date.substring(0, 7); // YYYY-MM
        if (!monthlyData[month]) {
            monthlyData[month] = { income: 0, expenses: 0 };
        }

        if (transaction.type === 'income') {
            monthlyData[month].income += transaction.amount;
        } else {
            monthlyData[month].expenses += transaction.amount;
        }
    });

    const months = Object.keys(monthlyData).sort();
    const incomeData = months.map(month => monthlyData[month].income);
    const expensesData = months.map(month => monthlyData[month].expenses);

    financeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'Ingresos',
                    data: incomeData,
                    backgroundColor: 'rgba(46, 204, 113, 0.8)',
                    borderColor: 'rgba(46, 204, 113, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Gastos',
                    data: expensesData,
                    backgroundColor: 'rgba(231, 76, 60, 0.8)',
                    borderColor: 'rgba(231, 76, 60, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function (value) {
                            return formatCurrency(value);
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
                        }
                    }
                }
            }
        }
    });
}

// Event Listeners
transactionForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const newTransaction = {
        id: Date.now(),
        description: document.getElementById('description').value,
        amount: parseFloat(document.getElementById('amount').value),
        type: document.getElementById('type').value,
        category: document.getElementById('category').value,
        date: document.getElementById('date').value
    };

    transactions.push(newTransaction);
    renderTransactions();
    calculateSummary();

    // Reset form
    transactionForm.reset();
    document.getElementById('date').value = new Date().toISOString().split('T')[0];
});

// Filtros
filterButtons.all.addEventListener('click', () => renderTransactions('all'));
filterButtons.income.addEventListener('click', () => renderTransactions('income'));
filterButtons.expense.addEventListener('click', () => renderTransactions('expense'));

// Inicializar aplicación
document.addEventListener('DOMContentLoaded', function () {
    // Establecer fecha actual por defecto
    document.getElementById('date').value = new Date().toISOString().split('T')[0];

    // Renderizar datos iniciales
    renderTransactions();
    calculateSummary();
});