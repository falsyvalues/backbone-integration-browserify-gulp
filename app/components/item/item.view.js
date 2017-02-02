import {Backbone} from '../../vendor';

import template from './item.jst';

export default Backbone.View.extend({

  template,

  initialize() {
    this.render();
  },

  render() {
    this.$el.html(this.template());
  }
});
