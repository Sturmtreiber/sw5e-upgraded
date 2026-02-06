/**
 * An abstract class containing common functionality between actor sheet configuration apps.
 * @extends {DocumentSheetV2}
 * @abstract
 */
export default class BaseConfigSheet extends foundry.applications.api.DocumentSheetV2 {
  /** @inheritdoc */
  async _onRender(options) {
    await super._onRender(options);
    if (!this.isEditable) return;
    const element = this.element;
    if (!element) return;
    for (const override of this._getActorOverrides()) {
      element.querySelectorAll(`input[name="${override}"],select[name="${override}"]`).forEach(el => {
        el.disabled = true;
        el.dataset.tooltip = "SW5E.ActiveEffectOverrideWarning";
      });
    }
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
}
