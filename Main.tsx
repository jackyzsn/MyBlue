import React from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, StackNavigationOptions } from '@react-navigation/stack';
import { HomeScreen } from './screens/HomeScreen';

type RootStackParamList = {
    Home: undefined;
    Home2: undefined;
}

const Stack = createStackNavigator<RootStackParamList>();

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

function Main(): JSX.Element {
    return (
        <SafeAreaView style={styles.container}>
            <GluestackUIProvider>
                <NavigationContainer>
                    <Stack.Navigator initialRouteName="Home">
                        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false } as StackNavigationOptions} />

                        <Stack.Screen name="Home2" component={HomeScreen} options={{ headerShown: false } as StackNavigationOptions} />
                    </Stack.Navigator>
                </NavigationContainer>
                {/* <Text>{t('appname')}</Text> */}
            </GluestackUIProvider>
        </SafeAreaView>
    );
}

export default Main;
