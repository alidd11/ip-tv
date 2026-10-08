import SwiftUI

struct WorldwideCountry: Codable, Identifiable {
    var id: String { code }
    let code: String
    let name: String
    let visible: Int
}

struct WorldwideManifest: Codable {
    let countries: [WorldwideCountry]
}

struct WorldwideFeed: Codable {
    let id: String?
}

struct WorldwideGuide: Codable {
    let site: String?
}

struct WorldwideChannel: Codable, Identifiable {
    let id: String
    let name: String
    let country: String
    let network: String?
    let aliases: [String]
    let categories: [String]
    let website: String?
    let isAdult: Bool
    let isClosed: Bool
    let feeds: [WorldwideFeed]
    let guides: [WorldwideGuide]
}

struct WorldwideExploreView: View {
    @State private var countries: [WorldwideCountry] = []
    @State private var records: [WorldwideChannel] = []
    @State private var selectedCountry = "GB"
    @State private var query = ""
    @State private var category = ""
    @State private var limit = 60
    @State private var countrySearch = ""
    @State private var choosingCountry = false
    @State private var selectedChannel: WorldwideChannel?
    private let canvas = Color(red: 0.027, green: 0.031, blue: 0.051)

    private var countryName: String {
        countries.first(where: { $0.code == selectedCountry })?.name ?? selectedCountry
    }

    private var categories: [String] {
        Array(Set(records.flatMap(\.categories))).sorted()
    }

    private var matches: [WorldwideChannel] {
        records.filter { channel in
            (category.isEmpty || channel.categories.contains(category)) &&
            (query.isEmpty || channel.name.localizedCaseInsensitiveContains(query) ||
             channel.aliases.contains(where: { $0.localizedCaseInsensitiveContains(query) }) ||
             channel.network?.localizedCaseInsensitiveContains(query) == true)
        }.sorted { a, b in
            if query.isEmpty { return a.name < b.name }
            let aExact = a.name.localizedCaseInsensitiveCompare(query) == .orderedSame
            let bExact = b.name.localizedCaseInsensitiveCompare(query) == .orderedSame
            if aExact != bExact { return aExact }
            return a.name < b.name
        }
    }

    var body: some View {
        ScrollView {
            LazyVStack(alignment: .leading, spacing: 18) {
                Text("WORLDWIDE DIRECTORY")
                    .font(.caption.weight(.bold))
                    .tracking(1.4)
                    .foregroundStyle(Color(red: 0.54, green: 0.49, blue: 1.0))
                Text("Explore every channel")
                    .font(.largeTitle.bold())
                    .foregroundStyle(.white)

                Button { choosingCountry = true } label: {
                    HStack {
                        Text(countryName)
                        Spacer()
                        Text("Change country  ▾")
                    }
                    .padding(16)
                    .background(.white.opacity(0.08), in: RoundedRectangle(cornerRadius: 16))
                }
                .foregroundStyle(.white)

                TextField("Search channels or broadcasters", text: $query)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
                    .padding(15)
                    .background(.white.opacity(0.09), in: RoundedRectangle(cornerRadius: 14))

                ScrollView(.horizontal, showsIndicators: false) {
                    HStack {
                        categoryButton("All", value: "")
                        ForEach(categories, id: \.self) { name in
                            categoryButton(name.capitalized, value: name)
                        }
                    }
                }

                Text(String(matches.count) + " channels found")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)

                ForEach(matches.prefix(limit)) { channel in
                    Button {
                        selectedChannel = channel
                    } label: {
                        VStack(alignment: .leading, spacing: 7) {
                            Text(channel.name).font(.headline).foregroundStyle(.white)
                            Text([channel.network, channel.categories.first, String(channel.feeds.count) + " feeds"]
                                .compactMap { $0 }.joined(separator: " · "))
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(17)
                        .background(.white.opacity(0.08), in: RoundedRectangle(cornerRadius: 17))
                    }
                    .buttonStyle(.plain)
                }
                if limit < matches.count {
                    Button("Load more channels") { limit += 60 }
                        .frame(maxWidth: .infinity).padding()
                }
            }
            .padding(20)
        }
        .background(canvas.ignoresSafeArea())
        .navigationTitle("Worldwide TV")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            if countries.isEmpty { loadManifest(); loadCountry() }
        }
        .onChange(of: selectedCountry) { _, _ in
            category = ""; query = ""; limit = 60; loadCountry()
        }
        .onChange(of: query) { _, _ in limit = 60 }
        .sheet(isPresented: $choosingCountry) {
            NavigationStack {
                List(countries.filter {
                    countrySearch.isEmpty || $0.name.localizedCaseInsensitiveContains(countrySearch) ||
                    $0.code.localizedCaseInsensitiveContains(countrySearch)
                }) { item in
                    Button {
                        selectedCountry = item.code
                        choosingCountry = false
                    } label: {
                        HStack {
                            Text(item.name)
                            Spacer()
                            Text(String(item.visible)).foregroundStyle(.secondary)
                        }
                    }
                }
                .searchable(text: $countrySearch)
                .navigationTitle("Countries")
                .toolbar {
                    ToolbarItem(placement: .topBarTrailing) {
                        Button("Done") { choosingCountry = false }
                    }
                }
            }
        }
        .sheet(item: $selectedChannel) { channel in
            NavigationStack {
                VStack(alignment: .leading, spacing: 16) {
                    Text(channel.name).font(.largeTitle.bold())
                    Text(String(channel.feeds.count) + " feed variants · " +
                        String(channel.guides.count) + " guide references")
                        .foregroundStyle(.secondary)
                    Text("Directory listing only. Playback not yet verified.")
                        .foregroundStyle(.secondary)
                    if let value = channel.website, let url = URL(string: value), url.scheme == "https" {
                        Link("Visit broadcaster website", destination: url)
                            .buttonStyle(.borderedProminent)
                    }
                    Spacer()
                }
                .padding(24)
                .navigationTitle("Channel details")
                .toolbar {
                    ToolbarItem(placement: .topBarTrailing) {
                        Button("Close") { selectedChannel = nil }
                    }
                }
            }
        }
    }

    @ViewBuilder
    private func categoryButton(_ name: String, value: String) -> some View {
        Button {
            category = value
            limit = 60
        } label: {
            Text(name)
                .font(.subheadline.bold())
                .padding(.horizontal, 14).padding(.vertical, 10)
                .background(category == value ? .white : .white.opacity(0.11), in: Capsule())
                .foregroundStyle(category == value ? .black : .white)
        }
        .buttonStyle(.plain)
    }

    private func loadManifest() {
        guard let url = Bundle.main.url(forResource: "manifest", withExtension: "json",
                                        subdirectory: "data/worldwide"),
              let data = try? Data(contentsOf: url),
              let manifest = try? JSONDecoder().decode(WorldwideManifest.self, from: data)
        else { return }
        countries = manifest.countries.filter { $0.visible > 0 }
            .sorted { $0.visible > $1.visible }
    }

    private func loadCountry() {
        guard let url = Bundle.main.url(forResource: selectedCountry, withExtension: "json",
                                        subdirectory: "data/worldwide/countries"),
              let data = try? Data(contentsOf: url),
              let values = try? JSONDecoder().decode([WorldwideChannel].self, from: data)
        else { records = []; return }
        records = values.filter { !$0.isAdult && !$0.isClosed }
    }
}
