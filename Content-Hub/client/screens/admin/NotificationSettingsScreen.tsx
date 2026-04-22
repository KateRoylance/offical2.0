import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Switch,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { AppColors, Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { apiRequest } from "@/lib/query-client";

interface AdminProfile {
  id: string;
  email: string;
  mobile: string | null;
  notifyOnUpload: string;
  notifyOnApproval: string;
  updatedAt: string;
}

export default function NotificationSettingsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const queryClient = useQueryClient();

  const [notifyOnUpload, setNotifyOnUpload] = useState(true);
  const [notifyOnApproval, setNotifyOnApproval] = useState(true);

  const { data: profile, isLoading } = useQuery<AdminProfile>({
    queryKey: ["/api/admin/profile"],
  });

  useEffect(() => {
    if (profile) {
      setNotifyOnUpload(profile.notifyOnUpload === "true");
      setNotifyOnApproval(profile.notifyOnApproval === "true");
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: async (data: { notifyOnUpload?: string; notifyOnApproval?: string }) => {
      return apiRequest("PATCH", "/api/admin/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/profile"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  const handleUploadToggle = (value: boolean) => {
    setNotifyOnUpload(value);
    updateMutation.mutate({ notifyOnUpload: value ? "true" : "false" });
  };

  const handleApprovalToggle = (value: boolean) => {
    setNotifyOnApproval(value);
    updateMutation.mutate({ notifyOnApproval: value ? "true" : "false" });
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={AppColors.orangePrimary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xl,
          paddingHorizontal: Spacing.lg,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.headerCard, Shadows.card]}>
          <View style={styles.headerIcon}>
            <Feather name="bell" size={28} color={AppColors.orangePrimary} />
          </View>
          <ThemedText type="h3" style={styles.headerTitle}>
            Notification Preferences
          </ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            Choose when you want to be notified about client activity
          </ThemedText>
        </View>

        <ThemedText style={styles.sectionTitle}>Client Activity</ThemedText>
        
        <View style={[styles.settingsCard, Shadows.card]}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={styles.settingIconContainer}>
                <Feather name="upload-cloud" size={20} color={AppColors.orangePrimary} />
              </View>
              <View style={styles.settingText}>
                <ThemedText style={styles.settingTitle}>Client Uploads</ThemedText>
                <ThemedText style={styles.settingDescription}>
                  Get notified when a client uploads new content
                </ThemedText>
              </View>
            </View>
            <Switch
              value={notifyOnUpload}
              onValueChange={handleUploadToggle}
              trackColor={{ false: AppColors.neutral, true: AppColors.orangeLight }}
              thumbColor={notifyOnUpload ? AppColors.orangePrimary : AppColors.tertiaryText}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={styles.settingIconContainer}>
                <Feather name="check-circle" size={20} color={AppColors.orangePrimary} />
              </View>
              <View style={styles.settingText}>
                <ThemedText style={styles.settingTitle}>Content Approvals</ThemedText>
                <ThemedText style={styles.settingDescription}>
                  Get notified when a client approves scheduled content
                </ThemedText>
              </View>
            </View>
            <Switch
              value={notifyOnApproval}
              onValueChange={handleApprovalToggle}
              trackColor={{ false: AppColors.neutral, true: AppColors.orangeLight }}
              thumbColor={notifyOnApproval ? AppColors.orangePrimary : AppColors.tertiaryText}
            />
          </View>
        </View>

        <View style={styles.noteContainer}>
          <Feather name="info" size={16} color={AppColors.secondaryText} />
          <ThemedText style={styles.noteText}>
            Notifications will be sent to {profile?.email}
          </ThemedText>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  headerCard: {
    backgroundColor: AppColors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: AppColors.softCream,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  headerTitle: {
    color: AppColors.primaryText,
    marginBottom: Spacing.xs,
    textAlign: "center",
  },
  headerSubtitle: {
    color: AppColors.secondaryText,
    fontSize: 14,
    textAlign: "center",
  },
  sectionTitle: {
    color: AppColors.secondaryText,
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
    marginLeft: Spacing.sm,
  },
  settingsCard: {
    backgroundColor: AppColors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: Spacing.md,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    backgroundColor: AppColors.softCream,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    color: AppColors.primaryText,
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 2,
  },
  settingDescription: {
    color: AppColors.secondaryText,
    fontSize: 13,
  },
  divider: {
    height: 1,
    backgroundColor: AppColors.neutral,
    marginVertical: Spacing.lg,
  },
  noteContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  noteText: {
    color: AppColors.secondaryText,
    fontSize: 13,
    flex: 1,
  },
});
