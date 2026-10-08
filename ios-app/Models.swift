import Foundation
import Combine

struct TVCountry: Codable, Identifiable {
    var id: String { code }
    let code: String
    let name: String
    let flag: String
    let enabled: Bool
    let sortOrder: Int
}

struct ChannelAccess: Codable {
    let model: String
    let providerIds: [String]
    let packageIds: [String]
}

struct TVChannel: Codable, Identifiable {
    let id: String
    let name: String
    let shortName: String
    let country: String
    let categories: [String]
    let network: String?
    let enabled: Bool
    let sortOrder: Int
    let access: ChannelAccess
}

struct PlaybackSource: Codable, Identifiable {
    let id: String
    let feedId: String
    let type: String
    let url: String
    let playbackMode: String
    let authorization: String
    let accessModel: String
    let requiresAuth: Bool
    let priority: Int
    let enabled: Bool
}

@MainActor
final class CatalogueStore: ObservableObject {
    @Published private(set) var countries: [TVCountry] = []
    @Published private(set) var channels: [TVChannel] = []
    @Published private(set) var sources: [PlaybackSource] = []

    func load() {
        countries = decode("countries", subdirectory: "data")
            .filter(\.enabled)
            .sorted { $0.sortOrder < $1.sortOrder }

        channels = countries.flatMap { country in
            decode(country.code, subdirectory: "data/channels")
        }

        sources = decode("playback-sources.verified", subdirectory: "config")
    }

    func channels(for country: String) -> [TVChannel] {
        channels.filter { $0.country == country && $0.enabled }
            .sorted { $0.sortOrder < $1.sortOrder }
    }

    func source(for channel: TVChannel) -> PlaybackSource? {
        sources
            .filter { $0.feedId == channel.id + "-main" && $0.enabled &&
                $0.url.hasPrefix("https://") &&
                ["verified-official", "verified-public-authorized", "subscription-provider"]
                    .contains($0.authorization) }
            .sorted { $0.priority < $1.priority }
            .first
    }

    /** Approved direct HLS only; no websites, login pages or subscription feed guessing. */
    func nativeHlsSource(for channel: TVChannel) -> PlaybackSource? {
        sources.filter {
            $0.feedId == channel.id + "-main" && $0.enabled && !$0.requiresAuth &&
            $0.url.hasPrefix("https://") && $0.type == "hls" &&
            $0.playbackMode == "native" &&
            ["verified-official", "verified-public-authorized"].contains($0.authorization)
        }.sorted { $0.priority < $1.priority }.first
    }

    func nativeChannelQueue(for country: String) -> [TVChannel] {
        channels(for: country).filter { nativeHlsSource(for: $0) != nil }
    }

    func featured(for country: String) -> TVChannel? {
        channels(for: country).min { lhs, rhs in
            let lhsRank = rank(source(for: lhs))
            let rhsRank = rank(source(for: rhs))
            return lhsRank == rhsRank ? lhs.sortOrder < rhs.sortOrder : lhsRank < rhsRank
        }
    }

    func sourceLabel(for channel: TVChannel) -> String {
        guard let value = source(for: channel) else { return "Explore channels" }
        switch value.playbackMode {
        case "native": return "Watch channel"
        case "external": return "Watch on official site"
        case "handoff": return "View subscription"
        default: return "Explore channels"
        }
    }

    private func rank(_ source: PlaybackSource?) -> Int {
        guard let source else { return 9 }
        switch source.playbackMode {
        case "native" where source.type == "hls": return 0
        case "external": return 1
        case "handoff": return 2
        default: return 8
        }
    }

    private func decode<T: Decodable>(_ name: String, subdirectory: String) -> [T] {
        guard
            let url = Bundle.main.url(forResource: name, withExtension: "json", subdirectory: subdirectory),
            let data = try? Data(contentsOf: url),
            let value = try? JSONDecoder().decode([T].self, from: data)
        else {
            return []
        }
        return value
    }
}
