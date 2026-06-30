(function () {
  function fieldValue(field, key, fallback) {
    if (!field) {
      return fallback;
    }

    if (typeof field.get === "function") {
      return field.get(key) || fallback;
    }

    return field[key] || fallback;
  }

  function normalizeValue(value) {
    if (!value) {
      return [];
    }

    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value.toJS === "function") {
      const jsValue = value.toJS();
      return Array.isArray(jsValue) ? jsValue : [];
    }

    if (typeof value.toArray === "function") {
      return value.toArray();
    }

    return [];
  }

  async function fetchUploadedImages(options) {
    const response = await fetch(options.manifestUrl, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`图片列表读取失败：${response.status}`);
    }

    const manifest = await response.json();
    const images = Array.isArray(manifest.images) ? manifest.images : [];

    return images
      .map((item) => ({
        name: item.name,
        path: item.path,
        thumbnail: item.thumbnail || item.path,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  function registerGalleryWidget() {
    if (!window.CMS || !window.createClass || !window.h) {
      console.error("Decap CMS widget APIs are not available.");
      return;
    }

    const h = window.h;

    const YybGalleryControl = window.createClass({
      getInitialState() {
        return {
          assets: [],
          error: "",
          filter: "",
          loading: true,
        };
      },

      componentDidMount() {
        this.refreshAssets();
      },

      getOptions() {
        return {
          manifestUrl: fieldValue(this.props.field, "manifest_url", "/uploads-manifest.json"),
        };
      },

      getSelection() {
        return normalizeValue(this.props.value);
      },

      getVisibleAssets() {
        const filter = this.state.filter.trim().toLowerCase();

        if (!filter) {
          return this.state.assets;
        }

        return this.state.assets.filter((asset) => asset.name.toLowerCase().includes(filter));
      },

      async refreshAssets() {
        this.setState({ error: "", loading: true });

        try {
          const assets = await fetchUploadedImages(this.getOptions());
          this.setState({ assets, loading: false });
        } catch (error) {
          this.setState({
            assets: [],
            error: error instanceof Error ? error.message : "图片列表读取失败",
            loading: false,
          });
        }
      },

      toggleImage(path) {
        const selection = this.getSelection();
        const nextSelection = selection.includes(path)
          ? selection.filter((item) => item !== path)
          : [...selection, path];

        this.props.onChange(nextSelection);
      },

      clearSelection() {
        this.props.onChange([]);
      },

      selectVisible() {
        const selection = this.getSelection();
        const merged = new Set(selection);

        this.getVisibleAssets().forEach((asset) => {
          merged.add(asset.path);
        });

        const nextSelection = Array.from(merged);
        this.props.onChange(nextSelection);
      },

      updateFilter(event) {
        this.setState({ filter: event.target.value });
      },

      renderToolbar(selection, visibleAssets) {
        return h(
          "div",
          { className: "yyb-gallery-toolbar" },
          h("input", {
            "aria-label": "搜索已上传图片",
            onChange: this.updateFilter,
            placeholder: "搜索已上传图片",
            type: "search",
            value: this.state.filter,
          }),
          h(
            "button",
            { onClick: this.refreshAssets, type: "button" },
            this.state.loading ? "读取中" : "刷新",
          ),
          h(
            "button",
            { disabled: visibleAssets.length === 0, onClick: this.selectVisible, type: "button" },
            "全选可见",
          ),
          h(
            "button",
            { disabled: selection.length === 0, onClick: this.clearSelection, type: "button" },
            "清空",
          ),
          h("span", null, `已选择 ${selection.length} 张`),
        );
      },

      renderAsset(asset, selection) {
        const checked = selection.includes(asset.path);

        return h(
          "label",
          { className: checked ? "yyb-gallery-item is-selected" : "yyb-gallery-item", key: asset.path },
          h("input", {
            checked,
            onChange: () => this.toggleImage(asset.path),
            type: "checkbox",
          }),
          h("img", { alt: "", loading: "lazy", src: asset.thumbnail }),
          h("span", null, asset.name),
        );
      },

      render() {
        const selection = this.getSelection();
        const visibleAssets = this.getVisibleAssets();

        return h(
          "div",
          { className: "yyb-gallery-widget" },
          h(
            "style",
            null,
            `.yyb-gallery-widget{border:1px solid #dfdfe3;border-radius:4px;padding:14px;background:#fff}.yyb-gallery-toolbar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:12px}.yyb-gallery-toolbar input{min-width:220px;min-height:36px;border:1px solid #d9d9df;border-radius:4px;padding:0 10px}.yyb-gallery-toolbar button{min-height:36px;border:1px solid #d9d9df;border-radius:4px;background:#f7f7f8;padding:0 12px;cursor:pointer}.yyb-gallery-toolbar button:disabled{opacity:.45;cursor:not-allowed}.yyb-gallery-toolbar span{color:#687083}.yyb-gallery-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(136px,1fr));gap:10px;max-height:520px;overflow:auto}.yyb-gallery-item{display:grid;grid-template-rows:110px auto;gap:8px;border:2px solid #e6e6eb;border-radius:4px;padding:8px;cursor:pointer;background:#fff;color:#687083}.yyb-gallery-item.is-selected{border-color:#3a69ff;background:#f3f6ff}.yyb-gallery-item input{position:absolute;opacity:0;pointer-events:none}.yyb-gallery-item img{width:100%;height:110px;object-fit:cover;background:#f0f0f2}.yyb-gallery-item span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:center}.yyb-gallery-message{color:#687083;line-height:1.6}.yyb-gallery-error{color:#b42318;line-height:1.6}`,
          ),
          this.renderToolbar(selection, visibleAssets),
          this.state.error && h("p", { className: "yyb-gallery-error" }, this.state.error),
          this.state.loading && h("p", { className: "yyb-gallery-message" }, "正在读取已上传图片..."),
          !this.state.loading &&
            !this.state.error &&
            visibleAssets.length === 0 &&
            h("p", { className: "yyb-gallery-message" }, "没有找到已上传图片。"),
          !this.state.loading &&
            !this.state.error &&
            visibleAssets.length > 0 &&
            h(
              "div",
              { className: "yyb-gallery-grid" },
              visibleAssets.map((asset) => this.renderAsset(asset, selection)),
            ),
        );
      },
    });

    CMS.registerWidget("yyb_gallery", YybGalleryControl);
  }

  registerGalleryWidget();
})();
