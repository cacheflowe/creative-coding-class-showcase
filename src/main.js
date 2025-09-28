import "./reset.css";
import "./styles.css";

import Config from "./config.js";

class App extends HTMLElement {
  connectedCallback() {
    requestAnimationFrame(() => this.render()); // solves circular import race condition
    addEventListener("hashchange", (event) => window.location.reload());
  }

  disconnectedCallback() {}

  css() {
    return /*css*/ `
      custom-app {
        position: absolute;
        display: block;
        width: 100%;
        height: 100%;
      }
    `;
  }

  render() {
    // handle hash "routes"
    let sketchId = window.location.hash.substring(1);
    if (sketchId === "") {
      let randomIndex = Math.floor(Math.random() * Config.sketches.length);
      window.location.hash = Config.sketches[randomIndex].slug; // default to first sketch
    }
    const sketchInfo = Config.sketches.find((s) => s.slug === sketchId);

    // iframe attributes
    const sketchH = sketchInfo.height + 42; // account for p5js editor header
    const iframePermissions = `frameborder="0" scrolling="auto" allow="accelerometer; ambient-light-sensor; autoplay; bluetooth; camera; encrypted-media; geolocation; gyroscope;     hid; microphone; magnetometer; midi; payment; usb; serial; vr; xr-spatial-tracking"`;
    const iframeSize = `width="${sketchInfo.width}" height="${sketchH}"`;

    // scale down for too-tall sketches
    // TODO: handle wide sketches too
    let iframeScale = "";
    if (sketchInfo.height > window.innerHeight) {
      const scaleFactor = (window.innerHeight / sketchInfo.height) * 0.9;
      iframeScale = `transform: scale(${scaleFactor});`;
    }

    // build nave
    let sketchesMenu = Config.sketches
      .map((s) => {
        return /*html*/ `
        <li>
          <a class="${s.slug === sketchId ? "active" : ""}" href="#${s.slug}">${s.title}</a>
          by ${s.author}
        </li>
      `;
      })
      .join("");

    // build output markup
    let output = /*html*/ `
      <main-nav class="init">
        <menu-icon>☰</menu-icon>
        <menu-attribution><b>${sketchInfo.title}</b><br>by ${sketchInfo.author}</menu-attribution>
        <section>
          <h1>Creative Coding Class Showcase</h1>
          <small>By students at the ATLAS Institute, CU Boulder, Fall 2025.</small>
          <nav>
            <ul>
              ${sketchesMenu}
            </ul>
          </nav>
        </section>
      </main-nav>
      <sketch-display>
        <p5-embed style="width: ${sketchInfo.width}px; height: ${sketchInfo.height}px; ${iframeScale}">
          <loading-message>Loading</loading-message>
          <iframe ${iframeSize} src="${sketchInfo.url}" ${iframePermissions}></iframe>
        </p5-embed>
        <sketch-info>
          <button>𝒊</button>
          <article>
            <h2>${sketchInfo.title}</h2>
            <p class="byline">by <b>${sketchInfo.author}</b></p>
            <p>${sketchInfo.description}</p>
          </article>
        </sketch-info>
      </sketch-display>
      <style>${this.css()}</style>
    `;
    // write to DOM
    this.innerHTML = output;

    // check for iframe loaded
    const iframe = this.querySelector("iframe");
    iframe.onload = () => {
      // console.log("iframe loaded", Date.now());
      setTimeout(() => {
        // console.log("iframe reveal", Date.now());
        this.querySelector("p5-embed").classList.add("loaded");
      }, 1200);
    };

    // remove init class after delay
    setTimeout(() => {
      this.querySelector("main-nav").classList.remove("init");
    }, 500);
  }
}

customElements.define("custom-app", App);

export default App;
