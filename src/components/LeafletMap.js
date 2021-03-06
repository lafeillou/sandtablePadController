import 'react-native-get-random-values';
import React, { Component } from 'react';

import {
  StyleSheet, View, Text, Dimensions, TouchableOpacity,
} from 'react-native';

import { WebView } from 'react-native-webview';
import Icon from 'yofc-react-native-vector-icons/Iconfont';
import Icon2 from 'yofc-react-native-vector-icons/Ionicons';

// import PropTypes  from 'prop-types';
import PropTypes from 'prop-types';
import { Actions } from 'react-native-router-flux';
import { calc } from '../lib/utils';

import TargetPanel from './TargetPanel';

import clientMethod from '../lib/postJsCode';


const patchPostMessageJsCode = `(${String(clientMethod)})(); true;`;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c132c',
  },
  btn: {
    width: calc(48),
    height: calc(48),
    backgroundColor: '#212e4e',
    borderRadius: calc(6),
    justifyContent: 'center',
    alignItems: 'center',
  },
  pos1: {
    position: 'absolute',
    left: calc(20),
    top: calc(20),
  },
  pos2: {
    position: 'absolute',
    right: calc(20),
    top: calc(20),
  },
  btnListWrap: {
    width: calc(48),
    height: calc(240),
    position: 'absolute',
    right: calc(20),
    bottom: calc(20),
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  flex0: {
    flex: 0,
  },
  // 中间顶部，连接状态反馈
  topWarningBlock: {
    width: calc(180),
    height: calc(48),
    backgroundColor: '#212e4e',
    position: 'absolute',
    top: calc(20),
    left: Dimensions.get('window').width / 2 - calc(90),
    borderRadius: calc(6),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  // 左下角地图切换按钮
  layerSwitch: {
    width: calc(96),
    height: calc(48),
    backgroundColor: '#212e4c',
    position: 'absolute',
    left: calc(20),
    bottom: calc(20),
    borderRadius: calc(6),
    flexDirection: 'row',
    overflow: 'hidden',
  },

  // 被选中地图图层按钮的样式
  layerSwitchBtnSelected: {
    backgroundColor: '#45aeff',
  },

  // 底部当前聚焦坐标信息
  currentFocus: {
    backgroundColor: '#212e4c',
    width: calc(240),
    height: calc(48),
    borderRadius: calc(6),
    flexDirection: 'row',
  },
  currentFocus_Pos: {
    position: 'absolute',
    left: Dimensions.get('window').width / 2 - calc(90),
    bottom: calc(20),
  },
  CurrentFocus__leftBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  CurrentFocus__midBtn: {
    flex: 0,
    alignItems: 'center',
    justifyContent: 'center',
    width: calc(160),
  },
  CurrentFocus__rightBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});


export default class LeafLetMap extends Component {
  webref = null;

  constructor(props) {
    super(props);
    this.state = {
      showTargetPanel: false,
      currentLayerName: '地图',
      // 当前聚焦的点
      currentFocusTarget: null,
    };
    this.openTargetPanel = this.openTargetPanel.bind(this);
    this.closeTargetPanel = this.closeTargetPanel.bind(this);
    this.testClick = this.testClick.bind(this);
    this.zoomIn = this.zoomIn.bind(this);
    this.zoomOut = this.zoomOut.bind(this);
    this.switchLayer = this.switchLayer.bind(this);
    this.setCurrentFocusTarget = this.setCurrentFocusTarget.bind(this);
    this.getCurrentFocusTarget = this.getCurrentFocusTarget.bind(this);
    this.showTargetObjectPanel = this.showTargetObjectPanel.bind(this);
  }


  getChildContext() {
    return {
      webref: this.webref,
      setCurrentFocusTarget: this.setCurrentFocusTarget,
      getCurrentFocusTarget: this.getCurrentFocusTarget,
    };
  }

  componentDidMount() {

  }

  /** *
     * 接收web发送过来的消息，调用rn中提供的方法
     */
    onMessage = (event) => {
      const data = JSON.parse(event.nativeEvent.data);
      if (!data) {
        return;
      }
      const { type, params, callback } = data;

      const json = {
        callback,
        args: params,
      };
      switch (type) {
        case 'getUser':
          this.webref.injectJavaScript(`webviewCallback(${JSON.stringify(json)})`);
          break;
        default:
          break;
      }
    }

    // 获取当前聚焦的点
    getCurrentFocusTarget() {
      const { currentFocusTarget } = this.state;
      return currentFocusTarget;
    }

    // 设置当前聚焦的点
    setCurrentFocusTarget(target) {
      this.setState({
        currentFocusTarget: target,
      });
    }

    // 打开目标点信息展示面板
    // eslint-disable-next-line class-methods-use-this
    showTargetObjectPanel() {
      Actions.drawerOpen();
    }

    openTargetPanel() {
      this.setState({
        showTargetPanel: true,
      });
    }

    closeTargetPanel() {
      this.setState({
        showTargetPanel: false,
      });
    }

    testClick() {
      // console.log('testClick');
      const json = {
        // 传入函数体,这个写法很反人类
        callback: String(`
          alert(data.name)
          alert(data.age)
        `),
        args: {
          name: 'lafeillou',
          age: 34,
        },
      };
      this.webref.injectJavaScript(`webviewCallback(${JSON.stringify(json)})`);
    }


    // 放大地图
    zoomIn() {
      const json = {
        callback: 'window.Vue.$emit("zoomIn");',
        args: {},
      };
      this.webref.injectJavaScript(`webviewCallback(${JSON.stringify(json)})`);
    }


    // 缩小地图
    zoomOut() {
      const json = {
        callback: 'window.Vue.$emit("zoomOut");',
        args: {},
      };
      this.webref.injectJavaScript(`webviewCallback(${JSON.stringify(json)})`);
    }

    // 切换地图图层
    switchLayer(name) {
      const json = {
        callback: 'window.Vue.$emit("switchLayer", {name: data.name})',
        args: {
          name,
        },
      };
      this.setState({ currentLayerName: name });
      this.webref.injectJavaScript(`webviewCallback(${JSON.stringify(json)})`);
    }

    render() {
      const { showTargetPanel, currentLayerName, currentFocusTarget } = this.state;

      return (

        <View style={styles.container}>
          <WebView
            onMessage={this.onMessage}
            ref={(r) => { this.webref = r; }}
            injectedJavaScript={patchPostMessageJsCode}
            style={{ backgroundColor: '#0c132c' }}
            source={{ uri: 'http://10.90.132.112:8080/' }}
          />
          {/* 菜单按钮 */}
          <TouchableOpacity style={[styles.btn, styles.pos1]} onPress={this.openTargetPanel}>
            <View style={[styles.btn]}>
              <Icon name="menu" size={calc(24)} color="white" />
            </View>
          </TouchableOpacity>
          {/* 用户按钮 */}
          <TouchableOpacity style={[styles.btn, styles.pos2]} onPress={this.testClick}>
            <View style={[styles.btn]}>
              <Icon name="user" size={calc(24)} color="white" />
            </View>
          </TouchableOpacity>

          {/* 右下角四个按钮 对应 搜索、放大、缩小、定位当前位置 */}
          <View style={styles.btnListWrap}>

            <TouchableOpacity style={[styles.btn, styles.flex0]}>
              <View style={[styles.btn, styles.flex0]}>
                <Icon name="search" size={calc(24)} color="white" />
              </View>
            </TouchableOpacity>


            <TouchableOpacity style={[styles.btn, styles.flex0]} onPress={this.zoomIn}>
              <View style={[styles.btn, styles.flex0]}>
                <Icon name="plus" size={calc(24)} color="white" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.btn, styles.flex0]} onPress={this.zoomOut}>
              <View style={[styles.btn, styles.flex0]}>
                <Icon name="minus" size={calc(24)} color="white" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.btn, styles.flex0]}>
              <View style={[styles.btn, styles.flex0]}>
                <Icon name="aim" size={calc(24)} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          {/* 顶部连接状态反馈 */}
          <View style={styles.topWarningBlock}>
            <View style={[styles.btn, styles.flex0]}>
              <Icon name="tablet" size={calc(24)} color="white" />
            </View>
            <Text style={{ color: '#fff', fontSize: calc(26), lineHeight: calc(48) }}>•••</Text>
            <View style={[styles.btn, styles.flex0]}>
              <Icon name="disconnect" size={calc(24)} color="white" />
            </View>
            <Text style={{ color: '#fff', fontSize: calc(26), lineHeight: calc(48) }}>•••</Text>
            <View style={[styles.btn, styles.flex0]}>
              <Icon name="desktop" size={calc(24)} color="white" />
            </View>
          </View>

          {/* 左下角地图切换按钮 */}
          <View style={styles.layerSwitch}>
            <TouchableOpacity style={[{ flex: 1 }, currentLayerName === '地图' ? styles.layerSwitchBtnSelected : {}]} onPress={() => { this.switchLayer('地图'); }}>
              <Text style={{
                color: '#fff', lineHeight: calc(48), fontSize: calc(14), textAlign: 'center',
              }}
              >
                地图
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={[{ flex: 1 }, currentLayerName === '卫星' ? styles.layerSwitchBtnSelected : {}]} onPress={() => { this.switchLayer('卫星'); }}>
              <Text style={{
                color: '#fff', lineHeight: calc(48), fontSize: calc(14), textAlign: 'center',
              }}
              >
                卫星
              </Text>
            </TouchableOpacity>
          </View>

          {/* 底部当前聚焦目标信息 */}
          {currentFocusTarget && (
          <View style={[styles.currentFocus, styles.currentFocus_Pos]}>
            <View style={styles.CurrentFocus__leftBtn}>
              <Icon name="location" size={calc(24)} color="white" />
            </View>
            <View style={styles.CurrentFocus__midBtn}>
              <Text style={{ color: '#fff', fontSize: calc(18), lineHeight: calc(48) }} ellipsizeMode="tail" numberOfLines={1}>{currentFocusTarget.targetName}</Text>
            </View>
            <TouchableOpacity style={styles.CurrentFocus__rightBtn} onPress={() => { this.showTargetObjectPanel(); }}>
              <View>
                <Icon2 name="ios-information-circle" size={calc(24)} color="#e55c58" />
              </View>
            </TouchableOpacity>

          </View>
          ) }


          <TargetPanel isVisible={showTargetPanel} closeFn={this.closeTargetPanel} />
        </View>


      );
    }
}


LeafLetMap.childContextTypes = {
  // 老子就是要传一个对象过去试试; 老子成功了！！！
  webref: PropTypes.object,
  setCurrentFocusTarget: PropTypes.func,
  getCurrentFocusTarget: PropTypes.func,
};
