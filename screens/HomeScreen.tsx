import React, { useContext, useState, useEffect } from 'react';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Center } from '@/components/ui/center';
import { Switch } from '@/components/ui/switch';
import { HStack } from '@/components/ui/hstack';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { requestMultiple, checkMultiple, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { BleManager, Base64 } from 'react-native-ble-plx';
import { MyContext } from '../context/myContext';
import { MyContextType } from '../@types/mytype.d';
import colors from 'tailwindcss/colors';
import base64 from 'react-native-base64';

interface ImportHomeScreenProps {
    navigation: any;
}

const manager = new BleManager();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function HomeScreen({ navigation }: ImportHomeScreenProps): JSX.Element {
    const { config } = useContext(MyContext) as MyContextType;
    const [hasPermission, setHasPermission] = useState(config.hasPermission);
    const { t } = useTranslation();
    const [ledon, setLedon] = useState(false);
    const [ledDisabled, setLedDisabled] = useState(false);
    const [ledId, setLedId] = useState<string>('');

    const checkPermission = () => {
        if (Platform.OS === 'android') {
            const apiLevel = parseInt(Platform.Version.toString(), 10);

            if (apiLevel < 31) {
                checkMultiple([PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION]).then(
                    statuses => {
                        if (
                            statuses[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION] !== RESULTS.GRANTED
                        ) {
                            requestMultiple([
                                PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
                            ]).then(sts => {
                                if (
                                    sts[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION] === RESULTS.GRANTED
                                ) {
                                    setHasPermission(true);
                                } else {
                                    setHasPermission(false);
                                }
                            });
                        } else {
                            setHasPermission(true);
                        }
                    });
            } else {
                checkMultiple([PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION, PERMISSIONS.ANDROID.BLUETOOTH_CONNECT, PERMISSIONS.ANDROID.BLUETOOTH_SCAN]).then(
                    statuses => {
                        if (
                            statuses[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION] !== RESULTS.GRANTED ||
                            statuses[PERMISSIONS.ANDROID.BLUETOOTH_CONNECT] !== RESULTS.GRANTED ||
                            statuses[PERMISSIONS.ANDROID.BLUETOOTH_SCAN] !== RESULTS.GRANTED
                        ) {
                            requestMultiple([
                                PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION, PERMISSIONS.ANDROID.BLUETOOTH_CONNECT, PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
                            ]).then(sts => {
                                if (
                                    sts[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION] === RESULTS.GRANTED &&
                                    sts[PERMISSIONS.ANDROID.BLUETOOTH_CONNECT] === RESULTS.GRANTED &&
                                    sts[PERMISSIONS.ANDROID.BLUETOOTH_SCAN] === RESULTS.GRANTED
                                ) {
                                    setHasPermission(true);
                                } else {
                                    setHasPermission(false);
                                }
                            });
                        } else {
                            setHasPermission(true);
                        }
                    });
            }

        } else {
            setHasPermission(true);
        }
    };

    useEffect(() => {
        checkPermission();
    }, []);

    useEffect(() => {
        const connect = async (deviceId: string) => {
            try {
                await manager.connectToDevice(deviceId).then(device => {

                    console.log('Connected to device:', device.name);
                    setLedDisabled(false);

                    // Add your logic for handling the connected device

                    return device.discoverAllServicesAndCharacteristics();

                }).catch(error => {
                    // Handle errors
                    console.error(error);
                });

            } catch (error) {
                console.error('Error connecting to device:', error);
            }

        };

        const scanAndConnect = async () => {
            console.log('!!!! Scanning !!!!!!');
            if (Platform.OS === 'android' && await DeviceInfo.isEmulator()) {
                console.log('Cannot scan for BLE devices on Android emulator.');
                return;
            }

            manager.startDeviceScan(null, null, (error, scannedDevice) => {
                if (error) {
                    // Handle error (scanning will be stopped automatically)
                    console.log(error);
                    return;
                }

                console.log('Device found: ', scannedDevice?.localName, scannedDevice?.name, scannedDevice?.id);

                if (scannedDevice?.localName === 'MyESP32') {
                    manager.stopDeviceScan();
                    connect(scannedDevice.id);
                    setLedId(scannedDevice.id);
                }
            });
        };

        const subscription = manager.onStateChange(state => {
            if (state === 'PoweredOn') {
                console.log('!!! Power On !!!!!');
                scanAndConnect();
                subscription.remove();
            } else {
                console.log('Bluetooth is off or unavailable');
            }
        }, true);

        return () => subscription.remove();
    }, []);

    const handleToggle = async () => {
        console.log(ledon);
        setLedon(!ledon);

        const valueBase64: Base64 = !ledon ? base64.encode('jacky') : base64.encode('test');

        await manager
            .writeCharacteristicWithResponseForDevice(
                ledId, '4fafc201-1fb5-459e-8fcc-c5c9c331914b', 'beb5483e-36e1-4688-b7f5-ea07361b26a8', valueBase64).then(value => {
                    console.log('Write success: ', value);
                }).catch(async error => {
                    console.log('Write Failed: ', error);
                });
    };

    return (
        <Center>
            <Heading>{t('appname')}</Heading>
            <Text>{hasPermission ? t('has_permission') : t('no_permission')}</Text>

            <HStack space="md">
                <Switch
                    trackColor={{ false: colors.gray[300], true: colors.gray[500] }}
                    thumbColor={colors.gray[50]}
                    activeThumbColor={colors.gray[50]}
                    ios_backgroundColor={colors.gray[300]}
                    onChange={handleToggle}
                    value={ledon}
                    disabled={ledDisabled}
                />
                <Text size="sm" >LED ON</Text>
            </HStack>

        </Center>
    );
}
