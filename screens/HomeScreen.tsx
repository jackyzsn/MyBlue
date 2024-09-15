import React, { useContext, useState, useEffect } from 'react';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Center } from '@/components/ui/center';
import { useTranslation } from 'react-i18next';
import { Dimensions, Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { requestMultiple, checkMultiple, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { BleManager } from 'react-native-ble-plx';
import { MyContext } from '../context/myContext';
import { MyContextType } from '../@types/mytype.d';

interface ImportHomeScreenProps {
    navigation: any;
}
const deviceWidth = Dimensions.get('window').width;
// const deviceHeight = Dimensions.get('window').height;
// const contentWidth = deviceWidth - 10;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function HomeScreen({ navigation }: ImportHomeScreenProps): JSX.Element {
    const { config } = useContext(MyContext) as MyContextType;
    const [hasPermission, setHasPermission] = useState(config.hasPermission);
    const [manager] = useState(new BleManager());
    const { t } = useTranslation();

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
        const connect = async (deviceId: any) => {
            try {
                await manager.connectToDevice(deviceId).then(device => {
                    console.log('Connected to device:', device.name);

                    // Add your logic for handling the connected device

                    return device.discoverAllServicesAndCharacteristics();
                }).catch(error => {
                    // Handle errors
                    console.log(error);
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

            manager.startDeviceScan(null, null, (error, device) => {
                if (error) {
                    // Handle error (scanning will be stopped automatically)
                    console.log(error);
                    return;
                }

                console.log('Device found: ', device?.localName, device?.name, device?.id);

                // Check if it is a device you are looking for based on advertisement data
                // or other criteria.
                if (device?.name === 'Buds2') {

                    connect(device.id);
                    // Stop scanning as it's not necessary if you are scanning for one device.
                    manager.stopDeviceScan();

                    // Proceed with connection.
                    console.log('Connected to bluetooth..');
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
    }, [manager]);

    return (
        <Center>
            <Heading>{t('appname')}</Heading>
            <Text>{hasPermission ? t('has_permission') : t('no_permission')}</Text>
        </Center>
    );
}
