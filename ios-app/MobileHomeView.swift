import SwiftUI

struct MobileHomeView: View {
    @StateObject private var catalogue = CatalogueStore()
    @State private var country = "GB"

    private let canvas = Color(red: 0.027, green: 0.031, blue: 0.051)
    private let panel = Color(red: 0.071, green: 0.082, blue: 0.122)
    private let accent = Color(red: 0.541, green: 0.486, blue: 1.0)

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 30) {
                    hero
                    NavigationLink {
                        WorldwideExploreView()
                    } label: {
                        HStack {
                            Text("Explore 31,522 channels worldwide")
                                .font(.headline)
                            Spacer()
                            Image(systemName: "arrow.right")
                        }
                        .padding(18)
                        .background(.white.opacity(0.1), in: RoundedRectangle(cornerRadius: 18))
                    }
                    .buttonStyle(.plain)
                    .padding(.horizontal, 20)

                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 10) {
                            ForEach(catalogue.countries) { item in
                                Button {
                                    country = item.code
                                } label: {
                                    Text("\(item.flag)  \(item.name)")
                                        .font(.subheadline.weight(.semibold))
                                        .foregroundStyle(item.code == country ? .black : .white)
                                        .padding(.horizontal, 16)
                                        .padding(.vertical, 11)
                                        .background(item.code == country ? Color.white : panel)
                                        .clipShape(Capsule())
                                }
                                .buttonStyle(.plain)
                            }
                        }
                        .padding(.horizontal, 20)
                    }

                    channelSection("Live now", channels: channels.filter { $0.access.model != "subscription" })
                    channelSection("Premium sport", channels: channels.filter { $0.categories.contains("sports") })
                    channelSection("Cinema", channels: channels.filter { $0.categories.contains("movies") })
                }
                .padding(.bottom, 80)
            }
            .background(canvas.ignoresSafeArea())
            .toolbar(.hidden, for: .navigationBar)
        }
        .task { catalogue.load() }
    }

    private var channels: [TVChannel] {
        catalogue.channels(for: country)
    }

    private var heroChannel: TVChannel? {
        channels.first(where: { $0.id == "gb-sky-sports-main-event" }) ?? channels.first
    }

    private var hero: some View {
        ZStack(alignment: .bottomLeading) {
            LinearGradient(
                colors: [
                    Color(red: 0.15, green: 0.12, blue: 0.33),
                    Color(red: 0.06, green: 0.07, blue: 0.11),
                    canvas,
                ],
                startPoint: .top,
                endPoint: .bottom
            )

            VStack(alignment: .leading, spacing: 12) {
                Text("PREMIUM LIVE TV")
                    .font(.caption.weight(.bold))
                    .tracking(1.8)
                    .foregroundStyle(accent)

                Text(heroChannel?.name ?? "Live television, beautifully organised.")
                    .font(.system(size: 42, weight: .black, design: .rounded))
                    .foregroundStyle(.white)

                Text(heroChannel?.network ?? "Live channels, guide, sport and cinema.")
                    .font(.body)
                    .foregroundStyle(.secondary)

                if let channel = heroChannel {
                    NavigationLink {
                        PlayerView(channel: channel, source: catalogue.source(for: channel))
                    } label: {
                        Text(channel.access.model == "subscription" ? "Open provider" : "Watch live")
                            .font(.headline)
                            .foregroundStyle(.black)
                            .padding(.horizontal, 22)
                            .padding(.vertical, 14)
                            .background(.white)
                            .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
                    }
                    .buttonStyle(.plain)
                    .padding(.top, 8)
                }
            }
            .padding(.horizontal, 22)
            .padding(.bottom, 28)
        }
        .frame(height: 390)
    }

    @ViewBuilder
    private func channelSection(_ title: String, channels: [TVChannel]) -> some View {
        if !channels.isEmpty {
            VStack(alignment: .leading, spacing: 14) {
                Text(title)
                    .font(.title2.bold())
                    .foregroundStyle(.white)
                    .padding(.horizontal, 20)

                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 12) {
                        ForEach(channels) { channel in
                            NavigationLink {
                                PlayerView(channel: channel, source: catalogue.source(for: channel))
                            } label: {
                                ChannelTile(channel: channel, panel: panel, accent: accent)
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .padding(.horizontal, 20)
                }
            }
        }
    }
}

private struct ChannelTile: View {
    let channel: TVChannel
    let panel: Color
    let accent: Color

    var body: some View {
        ZStack(alignment: .bottomLeading) {
            LinearGradient(
                colors: channel.access.model == "subscription"
                    ? [Color(red: 0.17, green: 0.13, blue: 0.34), panel]
                    : [Color(red: 0.09, green: 0.19, blue: 0.23), panel],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            VStack(alignment: .leading, spacing: 8) {
                Text(channel.access.model == "subscription" ? "PREMIUM" : "LIVE")
                    .font(.caption2.bold())
                    .foregroundStyle(channel.access.model == "subscription" ? .yellow : accent)

                Spacer()

                Text(channel.shortName)
                    .font(.headline.weight(.bold))
                    .foregroundStyle(.white)
                    .lineLimit(2)
            }
            .padding(16)
        }
        .frame(width: 210, height: 132)
        .clipShape(RoundedRectangle(cornerRadius: 22, style: .continuous))
    }
}
