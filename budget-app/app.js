////////////////////////////////////////////////////////////
// Budget Controller

var budgetController = (function() {

    // Object constructure 
   var Income = function(id, description, value) {
       this.id = id;
       this.description = description;
       this.value = value;
       this.percentage = -1;
   };

   var Expense = function(id, description, value) {
       this.id = id;
       this.description = description;
       this.value = value;
   };
    
    // Calculate Percentages
    Expense.prototype.calcPercent = function(totalIncome) {
        if (totalIncome > 0) {
        this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };
    
    // Return Percentages
    Expense.prototype.getPercent = function() {
        return this.percentage;
    };
    
    // Filling total 
    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(curr) {
            sum += curr.value;
        });
        data.totals[type] = sum;
    };
    
    // Blank Data Array 
    var data = {
        allItems: {
            inc: [],
            exp: []
        },
        totals: {
            inc: [],
            exp: []
        }, 
        budget: 0, 
        percentage: -1
    };
    
    // Filling income and expenses - public
    return {
        addItem: function(type, des, val) {
            var newItem, ID;

            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            
            if (type === 'inc') {
                newItem = new Income(ID, des, val);
            } else if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            }
            
            data.allItems[type].push(newItem);
            return newItem;
        }, 
        
        // Deleting from income and expenses
        deleteItem: function(type, id) {
            var ids, index;
            
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });
            
            index = ids.indexOf(id);
            
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },
        
        // Filling budget and percentage
        calculateBudget: function() {
            
            // calculate total income and expenses
            calculateTotal('inc');
            calculateTotal('exp');
            
            // calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            
            // calculate the percentage of income thats been spent
            
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;    
            }   
            
        },
        
        //Calculate the percentage 
        calculatePercent: function() {
          
           data.allItems.exp.forEach(function(current) {
              current.calcPercent(data.totals.inc); 
           });
            
        },
        
        getPercent: function() {
            
            var allPerc = data.allItems.exp.map(function(current) {
                return current.getPercent();
            });
            return allPerc;
        },
        
        // Sending data to other modules
        getBudget: function() {
            return {
                budget: data.budget,
                totalIncome: data.totals.inc,
                totalExpense: data.totals.exp,
                percent: data.percentage
            };
        }
        
    };
    
    
})();


    

/////////////////////////////////////////////////////////////
// UI Controller

var UIController = (function() {
    
    // classes short list
    var DOMstrings = {
        type: '.add__type',
        description: '.add__description',
        value: '.add__value',
        inputButton: '.add__btn',
        incomeCont: '.income__list',
        expensesCont: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container', 
        expensesPercent: '.item__percentage', 
        dateLabel: '.budget__title--month'
    };
    
    var formatNumber = function(num, type) {
            var numSplit, int, dec, type;
            
            num = Math.abs(num);
            num = num.toFixed(2);
            
            numSplit = num.split('.');
            int = numSplit[0];
            if (int.length > 3) {
                int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
            }
            
            dec = numSplit[1];
                     
            return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;       
            
        };
    
    var forEachNode = function(list, callback) {
            for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
                }
            };

    return {
        
        // input - collecting whats in these boxes 
        
        getInput: function() {
            return {
            type: document.querySelector(DOMstrings.type).value,
            description: document.querySelector(DOMstrings.description).value,
            value: parseFloat(document.querySelector(DOMstrings.value).value)
        };      
    },
        
        // updating list container UI 
        addListItem: function(obj, type) {
            var html, newHtml, element;
            
        
        // Placeholder Text + establishing which container
            if (type === 'inc') {
                element = DOMstrings.incomeCont;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
                
            } else if (type === 'exp') {
                element = DOMstrings.expensesCont;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            
            // replace PH with the data 
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            // insert the html into the DOM 
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            
            
        },
        
        // Delete an item from the UI
        deleteListItem: function(selectorID) {
          
            // document.getElementById(selectorID).parentNode.removeChild(document.getElementById(selectorID));  
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
            
        },
        
        clearFields: function() {
            var fields, arrFields;
            
            fields = document.querySelectorAll(DOMstrings.description + ', ' + DOMstrings.value);
            
            arrFields = Array.prototype.slice.call(fields);
            
            arrFields.forEach(function(current, index, array) {
                current.value = "";
            });
            
            arrFields[0].focus();
            
        },
        
        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalIncome, 'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExpense, 'exp');
            
            if (obj.percent > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percent + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
            
        },
        
        displayPercent: function(percentages) {
          
            
            var fields = document.querySelectorAll(DOMstrings.expensesPercent);
            
            
            forEachNode(fields, function(current, index) {
                
                if (percentages[index] > 0) {
                        current.textContent = percentages[index] + '%';
                } else {
                        current.textContent = '---'
                }            
            });              
        },
        
        displayMonth: function() {
            var now, month, months, year;
            
            now = new Date();
            // var christmas = new Date(2018, 11, 25)
            
            months = ['January', 'Feburary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
            
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },
        
        changeType: function() {
            
            var fields = document.querySelectorAll(
                DOMstrings.type + ',' +
                DOMstrings.description + ',' +
                DOMstrings.value);
            
            forEachNode(fields, function(current) {
                current.classList.toggle('red-focus')
            });
            
            document.querySelector(DOMstrings.inputButton).classList.toggle('red');
        
        },
        
        getDOMstrings: function() {
            return DOMstrings;
        }
            
};
      
})();

///////////////////////////////////////////////////////////////
// App Controller

var controller = (function(budgetCtrl, UICtrl) {
    
    var getEventListeners = function() {
        
        var DOM = UICtrl.getDOMstrings(); 
        
        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);
        
        document.addEventListener('keypress', function(event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem(); 
                }
            });
    
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.type).addEventListener('change', UICtrl.changeType);
};
    
    var updateBudget = function() {
            
        // 1. calculate the budget
        budgetCtrl.calculateBudget();
        
        // 2. return the budget 
        var budget = budgetCtrl.getBudget();
        
        // 3. dislay the budget on the UI 
        UICtrl.displayBudget(budget);
    };
    
    var updatePercent = function() {
      
        // 1. Calculate percentages
        budgetCtrl.calculatePercent();
        
        // 2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercent();
        
        
        // 3. Update the UI with percentages
        UICtrl.displayPercent(percentages);
        
    };
    
    var ctrlAddItem = function() {
        var input, newItem;
        // 1. get the filled input data       
        input = UICtrl.getInput();
        
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            
        // 2. add the item to the budget controller
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);
        
        // 3. add the item to the UI 
        UICtrl.addListItem(newItem, input.type);
        
        // 4 clear fields
        UICtrl.clearFields();
        
        // 5. calculate and update budget
        updateBudget();
            
        //6. Calculate and update percent 
        updatePercent();
            
        }    
    };
    
    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            // 1 delete item from data structure
            budgetCtrl.deleteItem(type, ID);
            
            // 2 delete item from the UI
            UICtrl.deleteListItem(itemID);
            
            // 3 update and show the new budget
            updateBudget();
            
            // 4. Update percentages 
            updatePercent();
        }
    };
    
    return {
        init: function() {
            console.log('Yo boyyyy, we\'re under way!');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalIncome: 0,
                totalExpense: 0,
                percent: -1
            });
            getEventListeners();
            
        }
    };
    
})(budgetController, UIController);

controller.init();