var mysql = require('mysql');
var inquirer = require('inquirer');

var connection = mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    database: 'bamazon',
    password: '',
    multipleStatements: true
});

connection.connect(function(err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }
    console.log('connected as id ' + connection.threadId);
    start()
});

var start = function() {
    var startQry = connection.query('SELECT `item_id`, `product_name`, `price` FROM `products`', function (error, results, fields) {
        console.log('Welcome to Bamazon! Check out our inventory');
        setTimeout( () => { 
            for (var i = 0; i < results.length; i++) {
                console.log('ID: ' + results[i].item_id + ',  ' + results[i].product_name + ',  price: $' + results[i].price);
            };
        }, 1000);
        setTimeout( () => { 
            order()
        }, 3000)
    })
}
var order = function() {
    inquirer.prompt([{
        type:'input',
        name:'item_id',
        message: 'Enter the ID of the product you want to order:',
    },{
        type: 'input',
        name: 'quantity',
        message: 'How many units do you want?',
    }])
    .then(answers => {
        connection.query("SELECT * FROM products WHERE item_id=" + answers.item_id, function (error, results, fields) {
            var item = answers.item_id;
            var stocked = results[0].stock_quantity;
            var price = results[0].price;
            var quantity = answers.quantity;
            orderFork(item, stocked, quantity, price);
            setTimeout( () => {
                contQuit()
            }, 5000)
        })
    })
}
var orderFork = function(item, stocked, quantity, price) {
    if (stocked < quantity) {
        console.log("We only have " + stocked + " units in inventory, and are unable to complete your order at this time");
    } else if (stocked >= quantity) {
        console.log('Plase wait while we process your order...');
        setTimeout( () => {
            connection.query("UPDATE products SET stock_quantity=(stock_quantity-"+quantity+") WHERE item_id="+item, function (error, results, fields) {
                if (error) throw error;
                calcTotal(price, quantity)
            })
        }, 2500)
    }
}
var contQuit = function() {
    inquirer.prompt({
        type: 'list',
        name: 'contShop',
        message: 'Would you like to continue shopping or exit Bamazon?',
        choices: ['Continue Shopping', 'Exit Bamazon']
    })
    .then(answers => {
        if (answers.contShop === 'Continue Shopping') {
            start();
        } else {
            connection.end();
        }
    })
}
var calcTotal = function(price, quantity) {
    var totalCost = price * quantity;
    console.log("Thank You!  Your order has been processed");
    console.log('\nYour total cost is: $' + totalCost)
}