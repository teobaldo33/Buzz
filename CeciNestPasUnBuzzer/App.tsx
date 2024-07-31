import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import HomeScreen from './src/HomeScreen'
import GameScreen from './src/GameScreen'
import AdminScreen from './src/AdminScreen'
import ErrorBoundary from './src/ErrorBoundary'

export type RootStackParamList = {
    Home: undefined
    Admin: {
        roomId: string
        userList?: { socketId: string; userName: string }[]
    }
    Game: { userName: string; roomId: string }
}

const Stack = createNativeStackNavigator<RootStackParamList>()

export default function App() {
    return (
        <ErrorBoundary>
            <NavigationContainer>
                <Stack.Navigator>
                    <Stack.Screen
                        name="Home"
                        component={HomeScreen}
                        options={{ title: 'Welcome buddy' }}
                    />
                    <Stack.Screen
                        name="Admin"
                        component={AdminScreen}
                        options={{ title: 'You have all the power' }}
                    />
                    <Stack.Screen
                        name="Game"
                        component={GameScreen}
                        options={{ title: 'Fight !' }}
                    />
                </Stack.Navigator>
            </NavigationContainer>
        </ErrorBoundary>
    )
}
