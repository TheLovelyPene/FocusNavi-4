import WidgetKit
import SwiftUI
import Intents

// Widget Provider
struct AccessibleMapsProvider: IntentTimelineProvider {
    func placeholder(in context: Context) -> AccessibleMapsEntry {
        AccessibleMapsEntry(date: Date(), configuration: ConfigurationIntent())
    }

    func getSnapshot(for configuration: ConfigurationIntent, in context: Context, completion: @escaping (AccessibleMapsEntry) -> ()) {
        let entry = AccessibleMapsEntry(date: Date(), configuration: configuration)
        completion(entry)
    }

    func getTimeline(for configuration: ConfigurationIntent, in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        var entries: [AccessibleMapsEntry] = []

        // Generate a timeline consisting of one entry for now
        let currentDate = Date()
        let entry = AccessibleMapsEntry(date: currentDate, configuration: configuration)
        entries.append(entry)

        let timeline = Timeline(entries: entries, policy: .atEnd)
        completion(timeline)
    }
}

// Widget Entry
struct AccessibleMapsEntry: TimelineEntry {
    let date: Date
    let configuration: ConfigurationIntent
}

// Widget View
struct AccessibleMapsWidgetEntryView : View {
    var entry: AccessibleMapsProvider.Entry

    var body: some View {
        VStack(spacing: 8) {
            // Header
            HStack {
                Image(systemName: "location.fill")
                    .foregroundColor(.blue)
                    .font(.title2)
                
                Text("Accessible Maps")
                    .font(.headline)
                    .fontWeight(.semibold)
                
                Spacer()
            }
            
            // Quick Actions
            VStack(spacing: 6) {
                // Read Directions Button
                Link(destination: URL(string: "shortcuts://run-shortcut?name=Read%20Google%20Maps%20Directions")!) {
                    HStack {
                        Image(systemName: "speaker.wave.2.fill")
                            .foregroundColor(.white)
                            .font(.caption)
                        
                        Text("Read Directions")
                            .font(.caption)
                            .fontWeight(.medium)
                            .foregroundColor(.white)
                        
                        Spacer()
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
                    .background(Color.blue)
                    .cornerRadius(8)
                }
                
                // Where Am I Button
                Link(destination: URL(string: "shortcuts://run-shortcut?name=Describe%20Current%20Location")!) {
                    HStack {
                        Image(systemName: "location.circle.fill")
                            .foregroundColor(.white)
                            .font(.caption)
                        
                        Text("Where Am I")
                            .font(.caption)
                            .fontWeight(.medium)
                            .foregroundColor(.white)
                        
                        Spacer()
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
                    .background(Color.green)
                    .cornerRadius(8)
                }
                
                // Start Navigation Button
                Link(destination: URL(string: "shortcuts://run-shortcut?name=Start%20Accessible%20Navigation")!) {
                    HStack {
                        Image(systemName: "arrow.triangle.turn.up.right.diamond.fill")
                            .foregroundColor(.white)
                            .font(.caption)
                        
                        Text("Start Navigation")
                            .font(.caption)
                            .fontWeight(.medium)
                            .foregroundColor(.white)
                        
                        Spacer()
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
                    .background(Color.orange)
                    .cornerRadius(8)
                }
            }
            
            // Footer
            HStack {
                Text("Voice: Say 'Hey Siri' + command")
                    .font(.caption2)
                    .foregroundColor(.secondary)
                
                Spacer()
            }
        }
        .padding()
        .background(Color(.systemBackground))
    }
}

// Widget Configuration
struct AccessibleMapsWidget: Widget {
    let kind: String = "AccessibleMapsWidget"

    var body: some WidgetConfiguration {
        IntentConfiguration(kind: kind, intent: ConfigurationIntent.self, provider: AccessibleMapsProvider()) { entry in
            AccessibleMapsWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Accessible Maps")
        .description("Quick access to accessibility features for Google Maps navigation.")
        .supportedFamilies([.systemMedium])
    }
}

// Widget Preview
struct AccessibleMapsWidget_Previews: PreviewProvider {
    static var previews: some View {
        AccessibleMapsWidgetEntryView(entry: AccessibleMapsEntry(date: Date(), configuration: ConfigurationIntent()))
            .previewContext(WidgetPreviewContext(family: .systemMedium))
    }
}

// Configuration Intent
class ConfigurationIntent: INIntent {
    // This can be expanded to include user preferences
    // For now, it's a basic configuration
}
