'use strict';

var users = global.nss.db.collection('users');
var trees = global.nss.db.collection('trees');
var Mongo = require('mongodb');
var treeHelper = require('../lib/tree-helper');
var _ = require('lodash');

exports.index = (req, res)=>
{
  res.render('game/index', {title: 'Builder'});
};

exports.sell = (req, res)=>
{
  var woodcount = req.body.woodcount;
  var userId = Mongo.ObjectID(req.body.userId);

  users.findOne({_id: userId}, (e, user)=>
  {
    var woodSold = woodcount <= user.wood ? woodcount : user.wood;

    user.wood -= woodSold;
    user.cash += woodSold/5;

    users.save(user, (e, count)=>res.send({wood: user.wood, cash: user.cash}));
  });
};

exports.chop = (req, res)=>
{
  var treeId = Mongo.ObjectID(req.params.treeId);

  trees.findOne({_id: treeId}, (e, tree)=>
  {
    // if(tree.height <= 48)
    // {
    //   res.send({canChop: false});
    // }
    // else
    // {
    users.findOne({_id: tree.userId}, (e, user)=>
    {
      user.wood += tree.height/2;
      users.save(user, (e, count)=>res.render('game/tree', {tree: tree, treeHelper: treeHelper}, (e, html)=>res.send({tree: html, wood: user.wood})));
    });
    // }
  });
};

exports.grow = (req, res)=>
{
  var treeId = Mongo.ObjectID(req.params.treeId);

  trees.findOne({_id: treeId}, (e, tree)=>
  {
    tree.height += _.random(0,2);
    tree.isHealthy = _.random(0,100) !== 70 ? tree.isHealthy : false;
    trees.save(tree, (er, count)=>res.render('game/tree', {tree: tree, treeHelper: treeHelper}, (e, html)=>res.send(html)));
  });
};

exports.forest = (req, res)=>
{
  var userId = Mongo.ObjectID(req.params.userId);
  trees.find({userId: userId}).toArray((e, objs)=>
  {
    res.render('game/forest', {trees: objs, treeHelper: treeHelper}, (e, html)=>
    {
      res.send(html);
    });
  });
};

exports.login = (req, res)=>
{
  var user = {
    username: req.body.username,
    wood: 0,
    cash: 0
  };

  users.findOne({username: user.username}, (er, existingUser)=>
  {
    if(existingUser)
    {
      res.send(existingUser);
    }
    else
    {
      users.save(user, (e, obj)=>res.send(obj));
    }
  });
};

exports.seed = (req, res)=>
{
  var userId = Mongo.ObjectID(req.body.userId);
  var tree = {
    height: 0,
    userId: userId,
    isHealthy: true,
    isChopped: false
  };

  trees.save(tree, (er, tr)=>res.render('game/tree', {tree: tr, treeHelper: treeHelper}, (e, html)=>res.send(html)));
};