import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './style.scss';

class ImageLoader extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.configureObserver();
  }

  configureObserver = () => {
    const previewImg = this.refs.previewImg;

    if ("IntersectionObserver" in window) {
      // IntersectionObserver Supported
      const config = {
        // If the image gets within 50px in the Y axis, start the download.
        rootMargin: '50px 0px',
        threshold: 0.01
      };
      var load = this.loadImage;

      let observer = new IntersectionObserver(onIntersection, config);
      observer.observe(previewImg);

      function onIntersection(entries, observer) {
        entries.forEach(change => {
          if (change.intersectionRatio > 0) {
            load();
            observer.unobserve(change.target);
          }
        });
      }
    } else {
      // IntersectionObserver NOT Supported
      load();
    }
  }

  loadImage = (retry) => {
    if (this.state.imageLoaded) return;
    var previewImg = this.refs.previewImg;
    var sourceImg = this.refs.sourceImg;

    previewImg.classList.remove('replace');

    if (!sourceImg.href) return;

    var img = new Image(), ds = sourceImg.dataset;
    if (ds) {
      if (ds.srcset) img.srcset = ds.srcset;
      if (ds.sizes) img.sizes = ds.sizes;
    }

    retry = 1 + (retry || 0);
    // retry fetching image, useful in-case of network related issues
    if (retry < 3) {
      img.onerror = () => {
        setTimeout(() => {
          this.loadImage(retry);
        }, retry * 2000);
      };
    }
    img.onload = () => this.addImg(img);
    img.className = 'reveal';
    img.src = sourceImg.href;
  }

  addImg = (img) => {
    this.setState({ imageLoaded: true });
    requestAnimationFrame(() => {
      var previewImg = this.refs.previewImg;
      var sourceImg = this.refs.sourceImg;

      sourceImg.insertBefore(img, previewImg && previewImg.nextSibling).addEventListener('animationend', () => {
        if (previewImg) {
          if (previewImg.alt) img.alt = previewImg.alt;
          sourceImg.removeChild(previewImg);
        }

        img.classList.remove('reveal');
      })
    })
  }

  onClick = (event) => {
    event.preventDefault();
    this.props.onClick && this.props.onClick();
  }

  render() {
    const { previewSrc, imageSrc, className } = this.props;

    return (
      <a href={imageSrc} className={`${className} progressive`} ref="sourceImg" onClick={this.onClick}>
        <img src={previewSrc} className="preview" ref="previewImg" />
      </a>
    )
  }
}

ImageLoader.propTYpes = {
  previewSrc: PropTypes.string.isRequired,
  imageSrc: PropTypes.string.isRequired,
  className: PropTypes.string,
  onClick: PropTypes.func,
}

export default ImageLoader;