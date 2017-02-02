import {_, Backbone} from '../../vendor';

import ItemView from '../item/item.view';


export default Backbone.View.extend({
  el: '#app',

  initialize() {
    this.render();
  },

  render() {
    new ItemView({
      el: this.$el
    });
  }
});
