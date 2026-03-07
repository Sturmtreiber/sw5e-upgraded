/**
 * An abstract class containing common functionality between actor sheet configuration apps.
 * @extends {DocumentSheetV2}
 * @abstract
 */
import {LegacyDocumentSheet} from "../application-v2-compat.mjs";

export default class BaseConfigSheet extends LegacyDocumentSheet {
  /** @inheritdoc */
  async _onFirstRender(options) {
    await super._onFirstRender(options);
    this._overrideInputChangeHandler ??= this._onOverrideInputChange.bind(this);
  }

  /** @inheritdoc */
  async _onRender(options) {
    await super._onRender(options);
    if (!this.isEditable) return;
    const element = this.element instanceof HTMLElement ? this.element : this.element?.[0];
    if (!element) return;
    if (this._overrideInputElement && this._overrideInputElement !== element) {
      this._overrideInputElement.removeEventListener("change", this._overrideInputChangeHandler);
    }
    if (this._overrideInputElement !== element) {
      element.addEventListener("change", this._overrideInputChangeHandler);
      this._overrideInputElement = element;
    }
    this._applyActorOverrideWarnings(element);
  }

  /* -------------------------------------------- */

  /**
   * Retrieve the list of fields that are currently modified by Active Effects on the Actor.
   * @returns {string[]}
   * @protected
   */
  _getActorOverrides() {
    return Object.keys(foundry.utils.flattenObject(this.object.overrides || {}));
  }

  /**
   * Apply disabled state and warnings to fields that are overridden by Active Effects.
   * @param {HTMLElement} element
   * @protected
   */
  _applyActorOverrideWarnings(element) {
    for (const override of this._getActorOverrides()) {
      element.querySelectorAll(`input[name="${override}"],select[name="${override}"]`).forEach(el => {
        el.disabled = true;
        el.dataset.tooltip = "SW5E.ActiveEffectOverrideWarning";
      });
    }
  }

  /**
   * React to input changes by re-applying override warnings.
   * @protected
   */
  _onOverrideInputChange() {
    if (!this.isEditable) return;
    const element = this.element instanceof HTMLElement ? this.element : this.element?.[0];
    if (!element) return;
    this._applyActorOverrideWarnings(element);
  }
}
