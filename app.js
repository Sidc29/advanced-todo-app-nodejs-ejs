const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require('lodash')

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://admin-sidc29:emJItc2UyotsVQUz@cluster0.jinkijn.mongodb.net/todolistDB');

const itemSchema = {
  name: String
}

const Item = mongoose.model("Item", itemSchema);

const listSchema = {
  name: String,
  items: [itemSchema]
}

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {
      res.render("list", {listTitle: "Today", newListItems: foundItems})
});

});

app.post("/", function(req, res){

  const itemName = _.capitalize(req.body.newItem);
  const listName = req.body.list;

  const item = new Item ({
    name: itemName
  })

  if(listName === "Today") {
    item.save();
    res.redirect("/")
  } else {
    List.findOne({name: listName}, (err, foundList)=> {
      if(!err) {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" +listName)
      }
    })
  }

 
 
});

app.post("/delete", (req, res)=> {

  const checkItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today") {
    Item.findByIdAndDelete(checkItemId, function(err) {
      if(err) {
        console.log(err);
      } else {
        console.log("Successfully deleted the item");
        res.redirect("/")
      }
    })
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkItemId}}}, (err)=> {
      if(!err) {
        res.redirect("/" +listName)
      }
    })
  }

  

})

app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, (err, foundList)=> {
    if(!err) {
      if(!foundList) {
        const list = new List({
          name: customListName,
          items: undefined
        })
        list.save();
        res.redirect("/" +customListName)
      } else {
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
      }
    }
  })
});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if(port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started successfully");
});
