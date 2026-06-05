import { Tabs } from 'expo-router';

export default function AppTabs() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="professor" options={{ title: 'Professor' }} />
      <Tabs.Screen name="explore" options={{ title: 'Aluno' }} />
    </Tabs>
  );
}
