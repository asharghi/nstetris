import { createApp, registerElement } from 'nativescript-vue';
import Home from './components/Home.vue';
import { SVGView } from '@nativescript-community/ui-svg';

registerElement('SVGView', () => SVGView);


createApp(Home).start();
