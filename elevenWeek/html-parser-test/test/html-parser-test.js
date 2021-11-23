import assert from 'assert';
import {parseHTML} from '../src/parser'

describe('parse html', () => {
  it("<a>link</a>", function() {
    const tree = parseHTML("<a></a>");
    assert.equal(tree.children[0].tagName, "a");
    assert.equal(tree.children[0].children.length, 0);
  });


  it("<A />", function() {
    const tree = parseHTML("<A />");
    assert.equal(tree.children[0].tagName, "A");
    assert.equal(tree.children[0].children.length, 0);
  });
  it("<a href='//time.geekbang.org'></a>", function() {
    const tree = parseHTML("<a href ='//time.geekbang.org' ></a>");
    if (tree.children[0]) {
      assert.equal(tree.children.length, 1);
      assert.equal(tree.children[0].children.length, 0);
    }
  });

  it("<a href id></a>", function() {
    const tree = parseHTML("<a href = 'abc' id></a>");

    if (tree.children[0]) {
      assert.equal(tree.children.length, 1);
      assert.equal(tree.children[0].children.length, 0);
    }
  });

  it("<a  id = 123></a>", function() {
    const tree = parseHTML("<a id = 123></a>");

    if (tree.children[0]) {
      assert.equal(tree.children.length, 1);
      assert.equal(tree.children[0].children.length, 0);
    }
  });

  it("<br />", function() {
    const tree = parseHTML("<br />");
    if (tree.children[0]) {
      assert.equal(tree.children.length, 1);
      assert.equal(tree.children[0].children.length, 0);
    }
  });

  it("<br/>", function() {
    const tree = parseHTML("<br/>");
    if (tree.children[0]) {
      assert.equal(tree.children.length, 1);
      assert.equal(tree.children[0].children.length, 0);
    }
  });

  it('<a  id = "123"></a>', function() {
    const tree = parseHTML('<a  id = "123"></a>');
    if (tree.children[0]) {
      assert.equal(tree.children.length, 1);
      assert.equal(tree.children[0].children.length, 0);
    }
  });

  it('<a  id = "123"/>', function() {
    const tree = parseHTML('<a  id = "123"/>');
    if (tree.children[0]) {
      assert.equal(tree.children.length, 1);
      assert.equal(tree.children[0].children.length, 0);
    }
  });

  it("<a  id = '123' />", function() {
    const tree = parseHTML("<a  id = '123' />");
    if (tree.children[0]) {
      assert.equal(tree.children.length, 1);
      assert.equal(tree.children[0].children.length, 0);
    }
  });

  it("entir dom", function() {
    const tree = parseHTML(`<html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Document</title>
    </head>
    <style>
      .flexDiv {
        display: flex;
        width: 500px;
        height: 300px;
        background-color:rgb(255,255,255)
      }
      #test{
        height: 500px
      }
    </style>
    <body>
      <div class="flexDiv" id="test">
        <div class="item1">item1</div>
      </div>
    </body>
  </html>
    `);

    assert.equal(tree.children.length, 2);
    assert.equal(tree.children[0].type, "element");
  });
});
