import SettingController from '../src/api/settingController';

describe('adminController', () => {
  it('should return version', async () => {
    process.env.VERSION = 'v1.0';
    const controller = new SettingController();

    const version = controller.getVersion();
    expect(version).toBe('v1.0');
  });
});
