// Budget controller

var budgetController = (function () {

// function constructor for Expence && Income 

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value/totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPecrentage = function() {
        return this.percentage;
    };

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value
    };

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };

    // Data Object
    var data = {
        allItems: {
            exp: [],
            inc: []
        },

        totals: {
            exp: 0,
            inc: 0
        },

        budget: 0,
        percentage: -1
    };

    return {

        //funkcja dodająca element do tabeli
        addItem: function(type, desc, val) {

            //Przypisanie ID do elementu dla danego typu
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            //stworzenie nowego elementu: expence lub income
            if (type === 'exp') {
                newItem = new Expense(ID, desc, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, desc, val);
            }

            // dodanie elementu na koniec tablicy
            data.allItems[type].push(newItem);

            return newItem;
        },

        deleteItem: function(type, id) {
            var ids, index;

            ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1)
            }

        },

        calculateTotal: function(type) {
            var sum = 0;
            sum = data.allItems[type].forEach(function(currentElement){
                sum += currentElement.value;
            });
        },

        calculateBudget: function() {
            calculateTotal('inc');
            calculateTotal('exp');
            data.budget = data.totals.inc - data.totals.exp;

            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp/data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentage: function() {
            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPecrentage();
            });
            return allPerc;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                income: data.totals.inc,
                expenses: data.totals.exp,
                percentage: data.percentage
            }
        },

            //funkcja testowa
        testing: function() {
            console.log(data);
        }
    }

})();

var UIController = (function() {

    // obiekt przedstawiajacy elementy HTML
    var domElements = {
        inputType: '.add__type',
        inputDesctiption: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetValue: '.budget__value',
        budgetIncomeValue: '.budget__income--value',
        budgetExpensesValue: '.budget__expenses--value',
        budgetExpensesPercentage: '.budget__expenses--percentage',
        container: '.container',
        expPercentagesLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function(num, type) {
        var numSplit, int, dec;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        dec = numSplit[1];

        if (int.length > 3) {
            //substr zwraca znaki. przyjmuje od początkowego znaku oraz na ile znaków chcemy wziąć
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    var nodeListForEach = function(list, callback) {
        for(var i = 0; i < list.length; i++){
            callback(list[i], i);
        }
    };


    return {

        //funkcja zwracająca elementy wpisane do formularza
        getInput: function() {
            return {
                type: document.querySelector(domElements.inputType).value,
                description: document.querySelector(domElements.inputDesctiption).value,
                value: parseFloat(document.querySelector(domElements.inputValue).value)
            };
        },

        //funkcja uaktualniajaca HTML o dodatkowe elementy w budżecie
        addListItem: function(obj, type) {
            var html, newHtml, element;

            if (type === 'inc') {
                element = domElements.incomeContainer;
                html ='<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if (type === 'exp') {
                element = domElements.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }

            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function(selectorId) {
            var el = document.getElementById(selectorId);

            el.parentNode.removeChild(el);
        },

        // Pozostawia pusty formularz po dodaniu elementu
        clearFields: function() {
            var fields, fieldsArr;

            fields = document.querySelectorAll(domElements.inputDesctiption + ', ' + domElements.inputValue);

            //Array.prototype.slice - Wydobywa fragment tablicy i zwraca go jako nową tablicę.
            //call(nazwaFunkcji) - wywołuje funkcję
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(current, index, arr) {
                current.value = "";
            });

            fieldsArr[0].focus();
        },

        displayBudget: function(obj) {
            var type;

            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(domElements.budgetValue).textContent = formatNumber(obj.budget, type);
            document.querySelector(domElements.budgetExpensesValue).textContent = formatNumber(obj.expenses, 'exp');
            document.querySelector(domElements.budgetIncomeValue).textContent = formatNumber(obj.income, 'inc');
            document.querySelector(domElements.budgetExpensesPercentage).textContent = obj.percentage;

            if (obj.percentage > 0) {
                document.querySelector(domElements.budgetExpensesPercentage).textContent = obj.percentage + '%';
            } else {
                document.querySelector(domElements.budgetExpensesPercentage).textContent = '---';
            }
        },

        displayPercentages: function(percentages) {
            //querySelectorAll zwraca NodeList, które nie ma forEach więc piszemy funkcję, która pzerabia ją w arraya
            var fields = document.querySelectorAll(domElements.expPercentagesLabel);

            nodeListForEach(fields, function(current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },

        displayMonth: function() {
            var now, month, months, year;

            now = new Date();

            month = now.getMonth();

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            year = now.getFullYear();

            document.querySelector(domElements.dateLabel).textContent = months[month] + ' ' + year;

        },

        changeType: function() {

            var fields = document.querySelectorAll(
                domElements.inputType + ',' +
                domElements.inputDesctiption + ',' +
                domElements.inputValue
            );

            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');
            });

            document.querySelector(domElements.inputBtn).classList.toggle('red');
        },

        getDomStrings: function() {
            return domElements;
        }     
    };

})();

var controller = (function (budgetCtrl, UICtrl) {

    //ustawienia eventu na klikniecie
    var setupEventListeners = function () {
        var DOM = UICtrl.getDomStrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
                updateBudget();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
    };

    // aktualizuje zmianę w budżecie
    var updateBudget = function () {
        //weź totala i wrzuć do htmla
        budgetCtrl.calculateBudget();

        var budget = budgetCtrl.getBudget();

        UICtrl.displayBudget(budget);
        
    };

    var updatePercentages = function() {
        budgetCtrl.calculatePercentage();
        var percentages = budgetCtrl.getPercentages();
        UIController.displayPercentages(percentages);
    };


    var ctrlDeleteItem = function(event) {
        var itemId, splitId, type, id;
        itemId = event.target.parentNode.parentNode.parentNode.id;

        if (itemId) {
            splitId = itemId.split('-');
            type = splitId[0];
            id = parseInt(splitId[1]);

            budgetCtrl.deleteItem(type, id);

            UICtrl.deleteListItem(itemId);

            updateBudget();

            updatePercentages();
        };

    };

    // wselkie dzialania zwiazane z działaniami w aplikacji
    var ctrlAddItem = function() {
        var input = UICtrl.getInput();

        if(input.description !== "" && !isNaN(input.value) && input.value > 0) {
            var newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            UICtrl.addListItem(newItem, input.type);
            UICtrl.clearFields();
            budgetCtrl.calculateBudget(input.type, input.value);
            budgetCtrl.calculateTotal(input.type);
            updateBudget();
            updatePercentages();
        };
    };

    return {
        init: function (){
            setupEventListeners();
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                income: 0,
                expenses: 0,
                percentage: -1
            });
        }
    };
    
})(budgetController, UIController);

controller.init();