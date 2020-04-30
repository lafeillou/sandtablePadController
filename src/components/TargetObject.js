import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, ToastAndroid,
} from 'react-native';

import Icon from 'yofc-react-native-vector-icons/Iconfont';
import PropTypes from 'prop-types';
import { Actions } from 'react-native-router-flux';
import { connect } from 'react-redux';
import Video from 'react-native-video';
import { calc } from '../lib/utils';

import TargetObjectTabs from './TargetObjectTabs';

import { sendCommandToRemote } from '../api/index';

// import Lightbox from './BaseLightbox';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0e1c3d',

  },

  header: {
    backgroundColor: '#212e4c',
    height: calc(48),
    flexDirection: 'row',
  },
  closeBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: calc(48),
    height: calc(48),
  },
  rightBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: calc(100),
    height: calc(48),
  },
  flex1: {
    flex: 1,
  },
  flex0: {
    flex: 0,
  },
  imageStyle: {
    width: calc(420),
    height: calc(300),
    marginLeft: calc(20),
    marginRight: calc(20),
    marginTop: calc(20),
  },
  backgroundVideo: {
    width: calc(420),
    height: calc(300),
    marginLeft: calc(20),
    marginRight: calc(20),
    marginTop: calc(20),
  },
});

class TargetObject extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      // 视频暂停
      videoPaused: true,
    };
    this.closeDrawer = this.closeDrawer.bind(this);
    this.onBuffer = this.onBuffer.bind(this);
    this.videoError = this.videoError.bind(this);
    this.togglePlay = this.togglePlay.bind(this);
    this.openLightbox = this.openLightbox.bind(this);
  }

  componentDidMount() {
    // console.log('===================context=============');
    // console.log(this);
    // console.log(this.context);
  }

  // eslint-disable-next-line class-methods-use-this
  closeDrawer() {
    // Actions.drawerClose();
    Actions.pop();
  }

  onBuffer(e) {
    // console.log(e);
  }

  videoError(e) {
    // console.log(e);
  }

  togglePlay() {
    const { videoPaused } = this.state;
    this.setState({
      videoPaused: !videoPaused,
    });
  }

  openLightbox() {
    const { setCurrentModal, currentTarget } = this.props;
    setCurrentModal({
      isVisible: true,
      componentName: '',
    });
    // 打开兵力部署弹窗
    // 发送远程指令
    sendCommandToRemote({
      targetId: currentTarget.id,
      eventSource: 'PAD',
      eventType: 'TROOPS',
      eventAction: 'SHOW',
    }).then((res) => {
      console.log('=============指令调用结果==================');
      console.log(res);
      if (res.status === 200) {
        ToastAndroid.showWithGravity(
          res.data.message,
          ToastAndroid.SHORT,
          ToastAndroid.TOP,
        );
      }
    });
  }

  render() {
    const { currentTarget, globalRemoteUrl } = this.props;
    const { videoPaused } = this.state;
    return (
      <View style={styles.container}>

        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.flex0, styles.closeBtn]}
            onPress={this.closeDrawer}
          >

            <Icon
              name="close"
              size={calc(18)}
              color="#45AEFF"
              style={{ lineHeight: calc(48), textAlign: 'center' }}
            />


          </TouchableOpacity>


          <View style={{ flex: 1 }}>
            <Text style={{
              color: '#45AEFF', lineHeight: calc(48), fontSize: calc(18), fontWeight: 'bold',
            }}
            >
              {currentTarget.targetName}
            </Text>
          </View>


          <TouchableOpacity style={[styles.flex0, styles.rightBtn]} onPress={this.openLightbox}>

            <Text style={{ color: '#45AEFF', lineHeight: calc(48), fontSize: calc(18) }}>兵力部署</Text>

          </TouchableOpacity>
        </View>


        <View style={{ flex: 1 }}>
          <TargetObjectTabs>
            <View style={{
              flex: 1,
            }}
            >
              {currentTarget.targetDesc && (
              <Text style={{
                color: '#fff', lineHeight: calc(20) * 1.5, paddingLeft: calc(20), paddingTop: calc(20), paddingRight: calc(20), paddingBottom: calc(20),
              }}
              >
                {currentTarget.targetDesc}
              </Text>
              )}

            </View>
            <View style={{ flex: 1 }}>

              {currentTarget.pictureList.map((o) => (
                <Image source={{ uri: `http://${globalRemoteUrl}/${o.fullPath}` }} style={styles.imageStyle} key={o.fileId} />
              ))}

            </View>
            <View style={{ flex: 1 }}>
              {currentTarget.mediaList.map((o) =>
              // 视频目前只支持一个
                (
                  <TouchableOpacity onPress={() => { this.togglePlay(); }} key={o.fileId}>
                    <Video
                      source={{ uri: `http://${globalRemoteUrl}/${o.fullPath}` }} // Can be a URL or a local file.
                      key={o.fileId}
                      ref={(ref) => {
                        this.player = ref;
                      }} // Store reference
                      onBuffer={this.onBuffer} // Callback when remote video is buffering
                      onError={this.videoError} // Callback when video cannot be loaded
                      style={[styles.backgroundVideo]}
                      paused={videoPaused}
                      resizeMode="cover"
                      volume={0.1}
                      controls
                    />
                  </TouchableOpacity>
                ))}
            </View>
          </TargetObjectTabs>
        </View>
      </View>
    );
  }
}

TargetObject.propTypes = {
  currentTarget: PropTypes.object,
  globalRemoteUrl: PropTypes.string,
  setCurrentModal: PropTypes.func,
};


const mapStateToProps = (state) => ({
  currentTarget: state.app.currentTarget,
  videoPause: state.app.videoPause,
  globalRemoteUrl: state.app.globalRemoteUrl,
});

const mapDispatchToProps = (dispatch) => ({
  setCurrentModal: dispatch.app.setCurrentModal,
});

export default connect(mapStateToProps, mapDispatchToProps)(TargetObject);
