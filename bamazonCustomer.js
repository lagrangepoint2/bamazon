var mysql = require("mysql");
var inquirer = require("inquirer");
var mysql = require("mysql");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  user: "root",

  password: "password",
  database: "bamazonDB"
});

connection.connect(function(err) {
  if (err) throw err;

  printDB();
});

function printDB() {
  console.log("\n===============================================");
  console.log("\nWelcome to bamazon!");
  console.log("Here is what we have in stock in our warehouse!\n");
  console.log("===============================================\n");
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;

    for (var i = 0; i < res.length; i++) {
      console.log(
        "Item ID: " +
          res[i].item_id +
          " || Product: " +
          res[i].product_name +
          " || Department: " +
          res[i].department_name +
          " || Price: $" +
          res[i].price +
          " || Stock: " +
          res[i].stock_quantity
      );
    }
    console.log();
    userPrompt();
  });
}

function userPrompt() {
  inquirer
    .prompt([
      {
        type: "input",
        message: "What is the Item ID you would like to buy?\n",
        name: "itemID"
      },
      {
        type: "input",
        message: "How many would you like to buy?\n",
        name: "qty"
      }
    ])
    .then(function(inquirerResponse) {
      console.log();
      checkOrder(inquirerResponse.itemID, inquirerResponse.qty);
    });
}

function checkOrder(itemID, qty) {
  var tempItemID = parseInt(itemID - 1);
  var tempQty = parseInt(qty);

  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;

    var tempStock = res[tempItemID].stock_quantity;

    var newStock = tempStock - tempQty;

    if (newStock < 0) {
      console.log("\nSorry we do not have that much in stock!\n");
      printDB();
    } else {
      var query = connection.query(
        "UPDATE products SET ? WHERE ?",
        [
          {
            stock_quantity: newStock
          },
          {
            item_id: tempItemID + 1
          }
        ],
        function(error, response) {
          if (error) throw err;
          console.log("Order placed successfully!\n");
          //console.log(query.sql);
          // console.log('itemID: ' + res[tempItemID].item_id + " qty: " + res[tempItemID].stock_quantity);
          // console.log(response);
          if (response.changedRows > 0) {
            connection.query("SELECT * FROM products", function(err, res) {
              var total = parseFloat(res[tempItemID].price) * tempQty;
              console.log("Total cost of your order is: $", total +"\n");


              inquirer
              .prompt([
                {
                  type: "list",
                  message: "Would you like to continue shopping?\n",
                  choices: ["Yes!", "No thank you!"],
                  name: "choice"
                }
              ])
              .then(function(inquirerResponse) {
                // If the inquirerResponse confirms, we displays the inquirerResponse's username and pokemon from the answers.
                if (inquirerResponse.choice === "Yes!") {
                  printDB();
                } else {
                  connection.end();
                }
              });


            });

          } else {
            console.log("err");
          }
        }
      );
    }
  });
}
