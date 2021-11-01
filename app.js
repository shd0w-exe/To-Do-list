//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-pankaj:pank1999@cluster0.vgcb6.mongodb.net/todolistDB",{useNewUrlParser:true});
const itemSchema={
  name:String
};

const Item=mongoose.model("Item",itemSchema);

const item1= new Item({
  name:"<-- hit this to delete "
});

const item2=new Item({
 name:"click + to add new item"
});

const defaultitem=[item2,item1];


const listSchema={
  name:String,
  items:[itemSchema]
}
const List=mongoose.model("List",listSchema);

//const items = ["Buy Food", "Cook Food", "Eat Food"];
//const workItems = [];

app.get("/", function(req, res) {
  Item.find({},function(err,foundItem){
    if(foundItem.length==0){
      Item.insertMany(defaultitem,function(err){
        if(!err){
          console.log("inserted successfully");
          
        }
        });    
        res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: foundItem});
    }
  });

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list;

  const item=new Item({
    name:itemName
  });

   if(listName==="Today"){
     item.save();
     res.redirect("/");
   }
   else{
       List.findOne({name:listName},function(err,foundlist){
       foundlist.items.push(item);
       foundlist.save();
       res.redirect("/"+listName); 
     });
   }

});


app.post("/delete",function(req,res){
  const checkeditemid=req.body.checkbox;
  const listName=req.body.listName;

  if(listName==="Today"){
    Item.findByIdAndRemove(checkeditemid,function(err){
      if(!err){
        console.log("successfully removed");
        res.redirect("/");
      }
    });
  }
  else{
    List.findOneAndUpdate({name:listName}, {$pull: {items:{_id:checkeditemid}}}, function(err,foundlist){
      if(!err){
      
        console.log(listName);
        res.redirect("/"+listName);
      }   
    });
  }

  
});

app.get("/:customListName", function(req,res){
  const customListName=_.capitalize(req.params.customListName);
  
  List.findOne({name:customListName},function(err,foundlist){
    if(!err){
      if(!foundlist){
        const list=new List({
          name:customListName,
          items:defaultitem
        });
        list.save();
        res.redirect("/"+customListName);
      }
      else{
        res.render("list",{listTitle:foundlist.name,newListItems:foundlist.items});
      }
      
    }
  });
  //res.render("list",{listTitle:customListName,newListItems:defaultitem});
});

app.get("/about", function(req, res){
  res.render("about");
});


let port=process.env.PORT;
if(port==null || port==""){
  port=3000;
}

app.listen(port, function() {
  console.log("Server has  started on port 3000");
});

