/* jshint unused: false */
$(function()
{
  'use strict';
  
  var $forest = $('#forest');
  var user;

  $('#login').click(login);
  $('#seed').click(seed);
  $('#getForest').click(getForest);
  $forest.on('click', '.treeWrap:not(.dead)', action);
  $('#sell').click(sell);

  function sell(e)
  {
    var data = $(this).closest('form').serialize();
    data += `&userId=${$('#username').data('id')}`;
    
    $.ajax(
    {
      url: '/sell',
      type: 'PUT',
      data: data,
      success: r=>
      {
        $('#wood > span').text(r.wood.toString());
        $('#money > span').text(r.cash.toFixed(2));
      }
    });  

    e.preventDefault();
  }

  function action()
  {
    var $thisTree = $(this);
    var treeId = $thisTree.data('id');

    // if($thisTree.hasClass('dead'))
    // {
    //   chop();
    // }
    // else
    // {
    var userAction = $('input[name=action]:checked').val();
    switch(userAction)
    {
      case 'grow':
        grow();
        break;
      case 'chop':
        var $plant = $thisTree.children('.tree');
        if($plant.hasClass('adult') && !$plant.hasClass('stump'))
        {
          chop();
        }
        break;
    }
    // }

    function grow()
    {
      $.ajax(
      {
        url: `/tree/${treeId}/grow`,
        type: 'PUT',
        dataType: 'html',
        success: tree=>
        {
          $thisTree.replaceWith(tree);
        }
      });
    }

    function chop()
    {
      $.ajax(
      {
        url: `/tree/${treeId}/chop`,
        type: 'PUT',
        success: r=>
        {
          // if(r.canChop)
          // {
          $('#wood > span').text(r.wood.toString());
          $thisTree.replaceWith(r.tree);
          $thisTree.children('.tree').addClass('stump');
          // $thisTree.remove();
          // }
          // else
          // {
          //   alert('Tree is too young to chop');
          // }
        }
      });      
    }
  }

  function getForest()
  {
    var userId = $('#username').data('id');

    $.ajax(
    {
      url: `/forest/${userId}`,
      type: 'GET',
      dataType: 'html',
      success: trees=>
      {
        $forest.text('');
        $forest.append(trees);
      }
    });
  }

  function seed()
  {
    var userId = $('#username').data('id');

    $.ajax(
    {
      url: '/seed',
      type: 'POST',
      data: {userId: userId},
      dataType: 'html',
      success: tree=>
      {
        $forest.append(tree);
      }
    });
  }

  function login(e)
  {
    var data = $(this).closest('form').serialize();

    $.ajax(
    {
      url: '/login',
      type: 'POST',
      data: data,
      success: r=>
      {
        $('#login').prev().val('');
        $('#username').attr('data-id', r._id);
        $('#username').text(r.username);
        $('#wood > span').text(r.wood.toString());
        $('#money > span').text(r.cash.toFixed(2));
      }
    });

    e.preventDefault();
  }
});