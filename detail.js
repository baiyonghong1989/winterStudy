/**
 * Created by wWX431546 on 2017/1/3.
 */
var activity, beginTime, endTime; // 对应活动下单起止时间
var paymentMethod; // 支付方式
var payUrl; // 支付接口url
var paymentList; // 支付uuid
$(function () {
  var page = {
    //初始化
    render: function (data) {
      var data = data.result;
      if (!data.product) {
        return;
      }
      activity = data.activity;
      beginTime = data.beginTime;
      endTime = data.endTime;
      paymentMethod = activity.paymentMethod;
      var str = template('subject', data);
      $('#centent').append(str);
      var list = $('.site');
      if (list.length > 5) {
        list.parent().css('height', '142px'); //地址大于5个换行（最多10个）
      }
      // 样机阶段
      if (data.product.prototypeStage == 'PRODUCE') {
        $('.product_detail_state').addClass('product_detail_red');
      } else {
        $('.product_detail_state').addClass('product_detail_orange');
      }

      //无货状态下页面
      if (data.product.actualQty <= 0) {
        $('#submitOrderId').attr('disabled', 'true');
        $('#submitOrderId').removeClass('submit');
        $('#submitOrderId').html('已售罄');
        $('#submitOrderId').addClass('noStockQtyCls');
        $('.submit_fox').css({ cursor: 'default' });
      }
      //判断是否默认图片
      this.bindEvent();
      // 从模板中获取温馨提示和支付url
      this.getWarningTips(paymentMethod);
    },
    init: function () {
      var self = this;
      productId = ret.getQueryString('productId');
      activityId = ret.getQueryString('activityId');
      var param = {
        activityId: activityId, // 活动编号
        uuid: productId, // 商品编号
      };
      //页面渲染请求
      Jalor.doPost(
        ret.SERVICE_URL.goodDetail,
        param,
        function (data) {
          if (data.resultCode == '1') {
            console.log(data);
            self.render(data);
          } else if (data.resultCode == '2') {
            layer.alert(data.resultDesc);
          } else if (data.resultCode == '5001') {
            page.notActivity(data.result);
          }
        },
        function (error, XHT, message) {
          if (message) {
            var httpCode = JSON.parse(arguments[2]).httpCode;
            if (httpCode == '403') {
              location.href = '../../../servlet/logout';
            } else {
              self.serverBusy();
            }
          } else {
            self.serverBusy();
          }
        },
      );
      this.enableNoramlMode();
    },
    // 活动不存在或不是发布状态，则跳转到首页
    notActivity: function (activity) {
      var t = 10;
      var infoPre = '该活动已过期或不存在';
      if (activity != null && activity.beginTime && activity.endTime) {
        let beginTime = activity.beginTime;
        let endTime = activity.endTime;
        let beginDate = beginTime.slice(5, 7) + '月' + beginTime.slice(8, 10) + '日 ' + beginTime.slice(11, 16);
        let endDate = endTime.slice(5, 7) + '月' + endTime.slice(8, 10) + '日 ' + endTime.slice(11, 16);
        let actInfo = '（其发布时间为：<br/>' + beginDate + ' — ' + endDate + '），请关注活动首页公告。<br/>';
        infoPre = infoPre + actInfo;
      } else {
        infoPre = infoPre + '，请关注活动首页公告。<br/>';
      }

      var str =
        "<div id='not_activity_confirm_id'>" +
        infoPre +
        "点击 确定 （或 <span style='color: red'> " +
        t +
        's </span>后自动）跳到首页</div>';
      layer.confirm(str, { btn: ['确定'], title: '提示' }, function () {
        window.location.assign('index_01.html');
      });
      // 自动跳转
      var timer = setInterval(function () {
        t--;
        if (t <= 0) {
          clearInterval(timer);
          window.location.assign('index_01.html');
        } else {
          let info = infoPre + "点击 确定 （或<span style='color: red'> " + t + 's </span>后自动）跳到首页';
          $('#not_activity_confirm_id').html(info);
        }
      }, 1000);
    },
    // 服务忙，弹出框
    serverBusy: function () {
      layer.open({
        type: 1,
        shadeClose: true,
        title: false,
        closeBtn: false,
        area: ['500px', '300px'],
        content:
          '<div class="wj_indent_header"> <div class="wj_indent_itiem"><span>温馨提示</span></div> <img src="../images/close.png"></div>' +
          '<div class="wj_indent_conten" ><div class="wj_indent_conten_right"> <img src="../images/duy.png"></div>' +
          '<div class="wj_indent_conten_p"> <p>亲，同一时间访问用户数过多，建议您稍后再试！</p></div>' +
          '<div class="wj_indent_conten_btn"><div class="wj_next_confirm"> 确定</div></div></div>',
      });
      //关闭弹框
      $('body').on('click', '.wj_indent_header>img', function () {
        $('.layui-layer-shade').remove();
        $('.layui-layer ').remove();
      });
      $('body').on('click', '.wj_next_confirm', function () {
        $('.layui-layer-shade').remove();
        $('.layui-layer ').remove();
      });
    },
    enableNoramlMode() {
      if (window.buyMode !== 'normal') {
        console.log('model change to normal');
        clearInterval(window.buyInterval);
        window.buyInterval = setInterval(page.buy, 5000);
        window.buyMode = 'normal';
      }
    },
    enableSpeedMode() {
      if (window.buyMode !== 'speed') {
        console.log('model change to speed');
        clearInterval(window.buyInterval);
        window.buyInterval = setInterval(page.buy, 500);
        window.buyMode = 'speed';
      }
    },
    buySuccCallBak() {
      clearInterval(window.buyInterval);
      window.location.href = 'https://www.baidu.com';
    },
    isSpeedTime() {
      return (
        Math.abs(new Date().getTime() - new Date('2021/09/07 12:00:00')) < 5 * 60 * 1000 ||
        Math.abs(new Date().getTime() - new Date('2021/09/07 14:00:00')) < 5 * 60 * 1000
      );
    },
    checkModelChange() {
      if (page.isSpeedTime() && window.buyMode !== 'speed') {
        page.enableSpeedMode();
      } else if (!page.isSpeedTime() && window.buyMode !== 'normal') {
        page.enableNoramlMode();
      }
    },
    buy: () => {
      var activityId = ret.getQueryString('activityId');
      var data = {
        activityId: activityId, // 活动编号
        productId: productId, // 商品编号
        attrId: 1008, // 领取地点(地点编号)
        productQty: '1', // 商品数量(下单数量)
        paymentMethod: '1', // 支付方式
      };
      Jalor.doPost({
        url: ret.SERVICE_URL.postdetails,
        data: data,
        timeout: 60000, //超时时间：60秒
        success: function (data) {
          page.checkModelChange();
          if (data.resultCode == '1') {
            page.buySuccCallBak();
            alert('success');
          }
        },
      });
    },
    //事件绑定
    bindEvent: function () {
      var add = $('.add_cut').children().first();
      var shoppnum = $('.shoppnum_num');
      var limitQty = $('.limit_num_limitQty').text();
      var shoppingsum = $('.submit_sum');
      var price = $('.price_sum').text();
      //点击选中地点
      $('.site').on('click', function () {
        $(this).addClass('h_pitch');
        $(this).siblings().removeClass('h_pitch');
      });
      // 点击勾选申明
      $('.select_box').on('click', function () {
        $('.checkbox').toggleClass('select_ok');
      });

      //点击提交
      $('.submit').on('click', function () {
        if (!$('.checkbox').hasClass('select_ok')) {
          page.no_treaty();
          return false;
        }
        if (!$('.site').hasClass('h_pitch')) {
          page.no_address();
          return false;
        }

        // 校验是否在下单时间内
        var nowtime = new Date().getTime();
        if (nowtime < beginTime || nowtime > endTime) {
          ress = '当前时间不在活动下单时间范围内!';
          page.buyfail();
          return false;
        }
        //点击下单成功后的弹框
        var activityId = ret.getQueryString('activityId');
        var attrId = $('.h_pitch').data('id');
        var productQty = $('.shoppnum_num').val();
        var data = {
          activityId: activityId, // 活动编号
          productId: productId, // 商品编号
          attrId: attrId, // 领取地点(地点编号)
          productQty: productQty, // 商品数量(下单数量)
          paymentMethod: paymentMethod, // 支付方式
        };

        // 弹出框：正在生成订单
        page.submit_order_Queue('正在请求中，请稍候...');

        //提交订单请求
        Jalor.doPost({
          url: ret.SERVICE_URL.postdetails,
          data: data,
          timeout: 60000, //超时时间：60秒
          success: function (data) {
            layer.close(layloading);
            if (data.resultCode == '1') {
              if (paymentMethod == '1') {
                page.paymentPopup(data.result);
              } else {
                page.buysucceed();
              }
            } else if (data.resultCode == '2') {
              ress = data.resultDesc;
              page.buyfail();
            }
          },
          error: function (textStatus, xhr, errorThrown) {
            layer.close(layloading);
            if (xhr == 'timeout') {
              ress = "请求超时。为避免重复提交订单，请稍候查询'我的订单'，确认是否提交成功。";
              page.buyfail();
            } else if (xhr == 'Service Temporarily Unavailable') {
              ress = '亲，同一时间下单用户数过多，建议您稍后再试。';
              page.buyfail();
            } else if (xhr == 'Too Many Requests') {
              ress = '亲，同一时间下单用户数过多，建议您稍后再试。';
              page.buyfail();
            } else if (xhr == 'Forbidden') {
              location.href = '../../../servlet/logout';
            } else {
              if (errorThrown) {
                var httpCode = JSON.parse(arguments[2]).httpCode;
                if (httpCode == '403') {
                  location.href = '../../../servlet/logout';
                } else {
                  ress = xhr;
                  page.buyfail();
                }
              } else {
                ress = xhr;
                page.buyfail();
              }
            }
          },
        });
      });
      //关闭弹框
      $('body').on('click', '.h_indent_header>img', function () {
        $('.layui-layer-shade').remove();
        $('.layui-layer ').remove();
      });
      $('body').on('click', '.h_next_confirm', function () {
        $('.layui-layer-shade').remove();
        $('.layui-layer ').remove();
      });
      //点击查看订单
      $('body').on('click', '.h_next_indent', function () {
        location.href = 'orderlist.html';
      });
      //点击继续购买
      $('body').on('click', '.h_next_productList', function () {
        var activityId = ret.getQueryString('activityId');
        location.href = 'listproduct.html?activityId=' + activityId;
      });

      //点击去支付
      $('body').on('click', '.h_next_to_payment', function () {
        layer.closeAll();
        layloading = layer.msg('跳转支付中', { icon: 16, shade: 0.01, time: 60000 });
        $('.layui-layer-ico').css({ width: '32px', height: '32px' });

        var list = $(this).data('list').split(',');
        if (list && list.length > 0) {
          to_payment(list);
        } else {
          layer.closeAll();
          layer.alert('跳转失败，请到‘我的订单’重新发起支付！');
        }
      });

      //点击数量加+
      add.on('click', function () {
        var a = ++shoppnum.val(parseInt(shoppnum.val()))[0].value;
        if (a >= limitQty) {
          var a = shoppnum.val(limitQty);
          shoppingsum.text((price * limitQty).toFixed(2));
          return false;
        } else {
          shoppingsum.text((price * a).toFixed(2));
        }
      });
      //点击数量相减—
      var plus = $('.add_cut').children().last();
      plus.on('click', function () {
        var b = --shoppnum.val(parseInt(shoppnum.val()))[0].value;
        if (b <= 1) {
          var a = shoppnum.val(1);
          shoppingsum.text((price * 1).toFixed(2));

          return false;
        } else {
          shoppingsum.text((price * b).toFixed(2));
        }
      });

      //购买数量监听
      shoppnum.keyup(function () {
        var c = shoppnum.val();
        if (c >= parseInt(limitQty)) {
          shoppnum.val(limitQty);
          setTimeout(shoppingsum.text(price * limitQty), 1000);
        } else if (c <= 1) {
          var a = shoppnum.val(1);
          shoppingsum.text((price * 1).toFixed(2));
        } else {
          shoppingsum.text((price * c).toFixed(2));
        }
      });

      // 描述
      $('.product_detail_desc_content').each(function (i, obj) {
        var lineHeight = parseInt($(this).css('line-height'));
        var height = parseInt($(this).height());
        if (height / lineHeight > 3) {
          $(this).addClass('p-after');
          $(this).css('height', '65px');
        } else {
          $(this).removeClass('p-after');
        }
      });

      $(document).keydown(function (event) {
        if (event.keyCode == 32 || event.keyCode == 13) {
          console.log(event.keyCode);
          return false;
        }
      });
      // 活动申明
      var treatyUrl = $('#treatyId').attr('href');
      if (paymentMethod == '1') {
        $('#treatyId').attr('href', treatyUrl + '?pay=1');
      }
    },
    //点击下单成功后的弹框
    buysucceed: function () {
      layer.open({
        type: 1,
        shadeClose: true,
        title: false,
        closeBtn: false,
        area: ['620px', '400px'],
        content:
          '<div class="h_indent_header"><div class="h_indent_itiem"><span>下单成功</span></div>' +
          '<img src="../images/close.png"></div>' +
          '<div class="h_indent_conten" >' +
          '<div class="h_indent_conten_right">' +
          '<img src="../images/succ.png"></div>' +
          '<div class="h_indent_conten_p">' +
          '<p>下单成功！</p> </div>' +
          '<div><span style="margin-left: 46px;display: inline-block;width: 25px;height: 25px;background-image:url(../images/warming.png);background-size:100% 100%;no-repeat;border-radius:20px;vertical-align: middle;margin-top: 10px;"></span><p style="font-size:16px;text-align:center;display: inline-block;vertical-align: middle;margin-left: 10px;margin-top: 10px;color: #666666;">温馨提示</p>' +
          '<div style="margin-left:70px;color: red;margin-top: 10px; font-size: 16px"> * 下单后，请到“我的订单”列表手动确认订单，否则系统将自动取消<div></div></div></div>' +
          '<div class="h_indent_conten_btn">' +
          '<div class="h_next_indent">查看订单</div>' +
          '<div class="h_next_productList"> 继续购买</div> </div></div>',
      });
    },
    //点击下单添加数量超限定后的弹框
    buyfail: function () {
      layer.open({
        type: 1,
        shadeClose: false,
        closeBtn: false,
        title: false,
        area: ['620px', '400px'],
        content:
          '<div class="h_indent_header"><div class="h_indent_itiem"><span>下单失败</span></div>' +
          '<img src="../images/close.png"> </div> <div class="h_indent_conten" >' +
          '<div class="h_indent_conten_right"> <img src="../images/duy.png"> </div><div class="h_indent_conten_p">' +
          '<p>' +
          ress +
          '</p>  </div></div>',
      });
    },
    //请选择一个领取地点再提交！
    no_address: function () {
      layer.open({
        type: 1,
        shadeClose: true,
        closeBtn: false,
        title: false,
        area: ['620px', '400px'],
        content:
          '<div class="h_indent_header"> <div class="h_indent_itiem"><span>下单失败</span></div> <img src="../images/close.png"></div>' +
          '<div class="h_indent_conten" ><div class="h_indent_conten_right"> <img src="../images/duy.png"></div>' +
          '<div class="h_indent_conten_p"> <p>请选择一个领取地点再提交！</p></div>' +
          '<div class="h_indent_conten_btn"><div class="h_next_confirm"> 确定</div></div></div>',
      });
    },
    //未同意内购申明弹框
    no_treaty: function () {
      layer.open({
        type: 1,
        shadeClose: true,
        closeBtn: false,
        title: false,
        area: ['620px', '400px'],
        content:
          '<div class="h_indent_header"> <div class="h_indent_itiem"><span>下单失败</span></div> <img src="../images/close.png"></div>' +
          '<div class="h_indent_conten" ><div class="h_indent_conten_right"> <img src="../images/duy.png"></div>' +
          '<div class="h_indent_conten_p"> <p>请勾选同意工程机处理申明再提交！</p></div>' +
          '<div class="h_indent_conten_btn"><div class="h_next_confirm"> 确定</div></div></div>',
      });
    },

    // 下单成功-在线支付
    paymentPopup: function (list) {
      var uuid = list.join(',');
      layer.open({
        type: 1,
        shadeClose: true,
        closeBtn: false,
        title: false,
        area: ['620px', '360px'],
        content:
          '<div class="h_indent_header"><div class="h_indent_itiem"><span>下单成功</span></div>' +
          '<img src="../images/close.png"></div>' +
          '<div class="h_indent_conten" >' +
          '<div class="h_indent_conten_right">' +
          '<img src="../images/succ.png"></div>' +
          '<div class="h_indent_conten_p">' +
          '<p>下单成功！</p> </div>' +
          '<div class="h_indent_conten_btn">' +
          '<div class="h_next_indent">我的订单</div>' +
          '<div class="h_next_to_payment" data-list="' +
          uuid +
          '" >立即支付</div> </div></div>',
      });
    },

    // 下单时排队 弹框
    submit_order_Queue: function (tipInfo) {
      layloading = layer.msg(tipInfo, { icon: 16, shade: 0.01, time: 60000 });
      $('.layui-layer-ico').css({ width: '32px', height: '32px' });
    },

    // 根据支付方式获取不同的温馨提示和支付url
    getWarningTips: function (paymentM) {
      var url;
      // 从缓存中获取提示和url
      if (paymentM == '1') {
        var sessionTips = window.sessionStorage.getItem('paymentTips');
        var sessionUrl = window.sessionStorage.getItem('payUrl');
        if (sessionTips && sessionUrl) {
          $('#warningTipsId').html(sessionTips);
          payUrl = sessionUrl;
          $('#warningTipsId').css({
            'margin-top': '12px',
          });
          return;
        }
        url = ret.SERVICE_URL.productWarningTips + '/1';
      } else {
        var sessionTips = window.sessionStorage.getItem('offlineTips');
        if (sessionTips) {
          $('#warningTipsId').html(sessionTips);
          $('#warningTipsId').css({
            'margin-top': '12px',
          });
          return;
        }
        url = ret.SERVICE_URL.productWarningTips + '/0';
      }

      // 发送请求，从服务器获取
      Jalor.doGet(url, null, function (data) {
        if (data.resultCode == '1') {
          $('#warningTipsId').html(data.result.warningTips);
          payUrl = data.result.payUrl;
          if (payUrl) {
            window.sessionStorage.setItem('payUrl', payUrl);
            window.sessionStorage.setItem('paymentTips', data.result.warningTips);
          } else {
            window.sessionStorage.setItem('offlineTips', data.result.warningTips);
          }
        }
        $('#warningTipsId').css({
          'margin-top': '12px',
        });
      });
    },
  };
  page.init();
});

// 在线支付：下单
function onlinePaymentSubmit(payJSON) {
  // 生成请求表单
  $('#onlinePayForm').attr('action', payUrl);
  $('#onlinePayForm').attr('method', 'post');
  // 遍历返回参数，并在表单中插入
  for (var key in payJSON) {
    if (payJSON[key] != null) {
      $('#onlinePayForm').append("<input type='text' name='" + key + "' value='" + payJSON[key] + "' />");
    }
  }
  $('#submitOrderId').attr('disabled', 'true');
  // 提交支付订单
  $('#onlinePayForm').submit();
  layer.closeAll();
}

function to_payment(list) {
  // 获取支付表单
  var url = ret.SERVICE_URL.onlinePaymentInfo;
  Jalor.doPost({
    async: false,
    url: url,
    data: list,
    success: function (data) {
      if (data.resultCode == 1) {
        onlinePaymentSubmit(data.result);
      } else {
        layer.closeAll();
        layer.alert('获取支付表单信息失败！请到‘我的订单’重新支付');
      }
    },
  });
}
