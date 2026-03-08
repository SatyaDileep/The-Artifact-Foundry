import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/theme/app_theme.dart';
import '../../data/providers/content_provider.dart';
import '../widgets/flip_card.dart';
import '../widgets/top_moments.dart';

class ArtifactDetailScreen extends ConsumerWidget {
  final String artifactId;

  const ArtifactDetailScreen({super.key, required this.artifactId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final contentAsync = ref.watch(contentDetailProvider(artifactId));

    return Scaffold(
      body: contentAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(child: Text('Error: $error')),
        data: (content) {
          return CustomScrollView(
            slivers: [
              SliverAppBar(
                expandedHeight: 250,
                pinned: true,
                flexibleSpace: FlexibleSpaceBar(
                  title: Text(
                    content.title,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  background: content.coverImageUrl != null
                      ? Image.network(
                          content.coverImageUrl!,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => _buildHeaderBg(),
                        )
                      : _buildHeaderBg(),
                ),
              ),
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (content.category != null)
                        Chip(
                          label: Text(content.category!.name),
                          backgroundColor: AppColors.primary.withOpacity(0.1),
                        ),
                      const SizedBox(height: 16),
                      if (content.sourceUrl != null)
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton.icon(
                            onPressed: () => _launchUrl(content.sourceUrl!),
                            icon: const Icon(Icons.open_in_new),
                            label: const Text('Go to Source'),
                          ),
                        ),
                      const SizedBox(height: 24),
                      if (content.quotes.isNotEmpty) ...[
                        const Text(
                          'Top Moments',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 12),
                        TopMoments(quotes: content.quotes),
                        const SizedBox(height: 24),
                      ],
                      if (content.flashcards.isNotEmpty) ...[
                        const Text(
                          'Flashcards',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 12),
                        SizedBox(
                          height: 200,
                          child: ListView.builder(
                            scrollDirection: Axis.horizontal,
                            itemCount: content.flashcards.length,
                            itemBuilder: (context, index) {
                              final card = content.flashcards[index];
                              return Padding(
                                padding: const EdgeInsets.only(right: 12),
                                child: FlipCard(
                                  front: card.front,
                                  back: card.back,
                                ),
                              );
                            },
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildHeaderBg() {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [AppColors.primary, AppColors.secondary],
        ),
      ),
    );
  }

  Future<void> _launchUrl(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.inAppWebView);
    }
  }
}
