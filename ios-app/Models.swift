import Foundation

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
}

@MainActor
final class CatalogueStore: ObservableObject {
    @Published private(set) var countries: [TVCountry] = []
    @Published private(set) var channels: [TVChannel] = []
    @Published private(set) var sources: [PlaybackSource] = []

    func load() {
        countries = decode("countries", subdirectory: "catalogue")
            .filter(\.enabled)
            .sorted { $0.sortOrder < $1.sortOrder }

        channels = countries.flatMap { country in
            decode(country.code, subdirectory: "catalogue/channels")
        }

        sources = decode("playback-sources.verified", subdirectory: "catalogue")
    }

    func channels(for country: String) -> [TVChannel] {
        channels.filter { $0.country == country && $0.enabled }
            .sorted { $0.sortOrder < $1.sortOrder }
    }

    func source(for channel: TVChannel) -> PlaybackSource? {
        sources
            .filter { $0.feedId == channel.id + "-main" }
            .sorted { $0.priority < $1.priority }
            .first
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
