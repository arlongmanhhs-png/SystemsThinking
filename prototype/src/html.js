// React with htm: components without a build step. React is loaded as a classic
// script from vendor/ before the modules run, so it is read from window here.
import htm from '../vendor/htm.module.js';

const React = window.React;

export const html = htm.bind(React.createElement);
export const {
  Fragment, createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState,
} = React;
