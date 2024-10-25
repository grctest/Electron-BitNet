import {app, Menu} from 'electron';

/**
 * For configuring the electron window menu
 */
export function initApplicationMenu(mainWindow) {
    const template = [
      {
        label: 'View',
        submenu: [
          {
            label: 'Send to tray',
            click() {
              mainWindow.minimize();
            }
          },
          { label: 'Reload', role: 'reload' },
          { label: 'Dev tools', role: 'toggleDevTools' }
        ]
      }
    ];
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}
