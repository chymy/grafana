import { coreModule } from 'app/core/core';

const template = `
<span class="panel-title">
  <span class="icon-gf panel-alert-icon"></span>
  <span class="panel-title-text">{{ctrl.panel.title | interpolateTemplateVars:this}}</span>
  <span class="panel-menu-container dropdown">
    <span class="fa fa-caret-down panel-menu-toggle" data-toggle="dropdown"></span>
    <ul class="dropdown-menu dropdown-menu--menu panel-menu" role="menu">
    </ul>
  </span>
  <span class="panel-time-info" ng-if="ctrl.timeInfo"><i class="fa fa-clock-o"></i> {{ctrl.timeInfo}}</span>
</span>`;

function renderMenuItem(item, ctrl) {
  let html = '';
  let listItemClass = '';

  if (item.divider) {
    return '<li class="divider"></li>';
  }

  if (item.submenu) {
    listItemClass = 'dropdown-submenu';
  }

  html += `<li class="${listItemClass}"><a `;

  if (item.click) {
    html += ` ng-click="${item.click}"`;
  }
  if (item.href) {
    html += ` href="${item.href}"`;
  }

  html += `><i class="${item.icon}"></i>`;
  html += `<span class="dropdown-item-text" aria-label="${item.text} panel menu item">${item.text}</span>`;

  if (item.shortcut) {
    html += `<span class="dropdown-menu-item-shortcut">${item.shortcut}</span>`;
  }

  html += `</a>`;

  if (item.submenu) {
    html += '<ul class="dropdown-menu dropdown-menu--menu panel-menu">';
    for (const subitem of item.submenu) {
      html += renderMenuItem(subitem, ctrl);
    }
    html += '</ul>';
  }

  html += `</li>`;
  return html;
}

function createMenuTemplate(ctrl) {
  let html = '';

  for (const item of ctrl.getMenu()) {
    html += renderMenuItem(item, ctrl);
  }

  return html;
}

/** @ngInject */
function panelHeader($compile) {
  return {
    restrict: 'E',
    template: template,
    link: (scope, elem, attrs) => {
      const menuElem = elem.find('.panel-menu');
      let menuScope;
      let isDragged;

      elem.click(evt => {
        const targetClass = evt.target.className;

        // remove existing scope
        if (menuScope) {
          menuScope.$destroy();
        }

        menuScope = scope.$new();
        const menuHtml = createMenuTemplate(scope.ctrl);
        menuElem.html(menuHtml);
        $compile(menuElem)(menuScope);

        if (targetClass.indexOf('panel-title-text') >= 0 || targetClass.indexOf('panel-title') >= 0) {
          togglePanelMenu(evt);
        }
      });

      function togglePanelMenu(e) {
        if (!isDragged) {
          e.stopPropagation();
          elem.find('[data-toggle=dropdown]').dropdown('toggle');
        }
      }

      let mouseX, mouseY;
      elem.mousedown(e => {
        mouseX = e.pageX;
        mouseY = e.pageY;
      });

      elem.mouseup(e => {
        if (mouseX === e.pageX && mouseY === e.pageY) {
          isDragged = false;
        } else {
          isDragged = true;
        }
      });
    },
  };
}

coreModule.directive('panelHeader', panelHeader);
