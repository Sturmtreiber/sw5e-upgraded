import BaseConfigSheet from "./base-config.mjs";

/**
 * Generic manual list editor for configurable actor values.
 */
export default class ManualListConfig extends BaseConfigSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["sw5e", "manual-list-config", "dialog"],
      template: "systems/sw5e/templates/apps/manual-list-config.hbs",
      width: 520,
      height: "auto",
      sheetConfig: false
    });
  }

  get id() {
    return `manual-list-${this.targetDocument?.id}-${this.options.listId}`;
  }

  get title() {
    return `${this.options.label}: ${this.targetDocument?.name ?? ""}`;
  }

  /**
   * Compatibility getter for Foundry generations that expose either .document or .object.
   * @returns {Document}
   */
  get targetDocument() {
    return this.document ?? this.object;
  }

  _listFlagPath() {
    return `manualLists.${this.options.listId}`;
  }

  _getCurrentEntries() {
    const existing = this.targetDocument.getFlag("sw5e", this._listFlagPath());
    if (Array.isArray(existing) && existing.length) return foundry.utils.deepClone(existing);

    if (this.options.type === "number") {
      const value = Number(foundry.utils.getProperty(this.targetDocument, this.options.targetPath) ?? 0);
      return value ? [{ value, source: "Existing value", temporary: false }] : [];
    }

    if (this.options.type === "string-list") {
      const values = foundry.utils.getProperty(this.targetDocument, this.options.targetPath);
      if (values instanceof Set) {
        return Array.from(values).map(v => ({ value: v, source: "Existing value", temporary: false }));
      }
      if (Array.isArray(values)) {
        return values.map(v => ({ value: v, source: "Existing value", temporary: false }));
      }
      if (typeof values === "string" && values.trim()) {
        return [{ value: values, source: "Existing value", temporary: false }];
      }
      return [];
    }

    return [];
  }

  async getData(options={}) {
    const entries = this._entries ?? this._getCurrentEntries();
    const total = this.options.type === "number"
      ? entries.reduce((acc, e) => acc + Number(e.value || 0), 0)
      : entries.length;

    return {
      ...super.getData(options),
      label: this.options.label,
      type: this.options.type,
      total,
      entries
    };
  }

  activateListeners(html) {
    super.activateListeners(html);
    const html$ = html instanceof HTMLElement ? $(html) : html;
    html$.find(".manual-add-row").click(this._onAddRow.bind(this));
    html$.find(".manual-delete-row").click(this._onDeleteRow.bind(this));
    html$.find(".manual-inc").click(ev => this._onStep(ev, 1));
    html$.find(".manual-dec").click(ev => this._onStep(ev, -1));
  }

  _syncEntriesFromForm() {
    const data = foundry.utils.expandObject(this._getSubmitData());
    const rows = Object.values(data.entries ?? {});
    this._entries = rows.map(r => ({
      value: r.value,
      source: r.source || "",
      temporary: !!r.temporary
    }));
  }

  _onAddRow(event) {
    event.preventDefault();
    this._syncEntriesFromForm();
    this._entries ??= this._getCurrentEntries();
    this._entries.push({ value: this.options.type === "number" ? 0 : "", source: "", temporary: false });
    this.render();
  }

  _onDeleteRow(event) {
    event.preventDefault();
    this._syncEntriesFromForm();
    const idx = Number(event.currentTarget.dataset.index);
    this._entries = (this._entries ?? []).filter((_, i) => i !== idx);
    this.render();
  }

  _onStep(event, delta) {
    event.preventDefault();
    this._syncEntriesFromForm();
    const idx = Number(event.currentTarget.dataset.index);
    if (!this._entries[idx]) return;
    const value = Number(this._entries[idx].value || 0) + delta;
    this._entries[idx].value = value;
    this.render();
  }

  async _updateObject(event, formData) {
    const rows = Object.values(foundry.utils.expandObject(formData).entries ?? {})
      .map(r => ({ value: r.value, source: r.source || "", temporary: !!r.temporary }))
      .filter(r => `${r.value}`.trim() !== "");

    await this.targetDocument.setFlag("sw5e", this._listFlagPath(), rows);

    if (this.options.type === "number") {
      const total = rows.reduce((acc, e) => acc + Number(e.value || 0), 0);
      await this.targetDocument.update({ [this.options.targetPath]: total });
      return;
    }

    if (this.options.type === "string-list") {
      const values = Array.from(new Set(rows.map(r => `${r.value}`.trim()).filter(Boolean)));
      const current = foundry.utils.getProperty(this.targetDocument, this.options.targetPath);
      if (typeof current === "string") {
        await this.targetDocument.update({ [this.options.targetPath]: values.join("; ") });
      } else {
        await this.targetDocument.update({ [this.options.targetPath]: values });
      }
    }
  }
}
