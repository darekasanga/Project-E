/**
 * DefaultTemplates - Predefined templates for different message types
 */
import { FlexTemplate, FlexLayout, FlexTheme } from '../models/FlexTemplate.js';
import { Part, PartProps, PartStyle, ButtonAction } from '../models/Part.js';

export class DefaultTemplates {
  static createStatementTemplate() {
    const template = new FlexTemplate({
      name: '明細通知テンプレート',
      category: 'statement',
      altText: '延長保育の明細をお送りします'
    });

    // Header: Date and Title
    template.layout.addPart('header', 'date', {
      mode: 'auto',
      format: 'YYYY年MM月DD日'
    });

    template.layout.addPart('header', 'title', {
      text: '延長保育明細',
      level: 'h2'
    });

    // Body: Teacher, Items, Comment
    template.layout.addPart('body', 'teacher', {
      name: '田中先生',
      title: '担当'
    });

    template.layout.addPart('body', 'separator', {
      margin: 'md',
      color: '#e5e7eb'
    });

    template.layout.addPart('body', 'items', {
      items: [
        { name: '延長保育料', amount: 500, note: '17:00-18:00' },
        { name: '補食代', amount: 200, note: 'おやつ' }
      ],
      showTotal: true,
      currency: '円'
    });

    template.layout.addPart('body', 'comment', {
      text: 'お疲れ様でした。本日の延長保育の明細をお送りします。ご確認ください。',
      multiline: true
    });

    // Footer: Buttons
    template.layout.addPart('footer', 'button', {
      label: '確認しました',
      action: new ButtonAction({
        type: 'postback',
        label: '確認しました',
        data: 'confirm:{{STATEMENT_ID}}'
      }),
      style: 'primary'
    });

    template.layout.addPart('footer', 'reply_button', {
      label: '質問・修正依頼',
      dataTemplate: 'question:{{STATEMENT_ID}}'
    });

    return template;
  }

  static createConfirmTemplate() {
    const template = new FlexTemplate({
      name: '確認メッセージテンプレート',
      category: 'confirm',
      altText: 'ご確認をお願いします'
    });

    // Header: Tag and Title
    template.layout.addPart('header', 'tag', {
      label: '返信待ち',
      color: '#f59e0b',
      size: 'sm'
    });

    template.layout.addPart('header', 'title', {
      text: 'ご確認のお願い',
      level: 'h2'
    });

    // Body: Teacher, Comment, Image
    template.layout.addPart('body', 'teacher', {
      name: '佐藤先生',
      title: '担当'
    });

    template.layout.addPart('body', 'comment', {
      text: 'お迎えの件でご確認いただきたいことがあります。お時間のある時にご返信ください。',
      multiline: true
    });

    template.layout.addPart('body', 'spacer', {
      size: 'md'
    });

    // Footer: Reply button
    template.layout.addPart('footer', 'reply_button', {
      label: '返信する',
      dataTemplate: 'reply:{{MESSAGE_ID}}'
    });

    // Set theme colors
    template.layout.theme.primaryColor = '#f59e0b';
    template.layout.theme.secondaryColor = '#d97706';

    return template;
  }

  static createRefundTemplate() {
    const template = new FlexTemplate({
      name: 'キャンセル・返金通知テンプレート',
      category: 'refund',
      altText: 'キャンセル・返金のお知らせ'
    });

    // Header: Date and Title
    template.layout.addPart('header', 'date', {
      mode: 'auto',
      format: 'YYYY年MM月DD日'
    });

    template.layout.addPart('header', 'title', {
      text: 'キャンセル・返金通知',
      level: 'h2'
    });

    // Body: Teacher, Items, Comment
    template.layout.addPart('body', 'teacher', {
      name: '山田先生',
      title: '事務担当'
    });

    template.layout.addPart('body', 'separator', {
      margin: 'md',
      color: '#e5e7eb'
    });

    template.layout.addPart('body', 'comment', {
      text: 'お疲れ様です。以下の件についてキャンセル処理を行いました。',
      multiline: false
    });

    template.layout.addPart('body', 'items', {
      items: [
        { name: 'キャンセル項目', amount: -500, note: '延長保育料' },
        { name: '返金手数料', amount: 0, note: '今回は無料' }
      ],
      showTotal: true,
      currency: '円'
    });

    template.layout.addPart('body', 'comment', {
      text: '返金は来月の請求から差し引かせていただきます。ご不明な点がございましたらお気軽にお声かけください。',
      multiline: true
    });

    // Footer: Confirmation button
    template.layout.addPart('footer', 'button', {
      label: '返金完了確認',
      action: new ButtonAction({
        type: 'postback',
        label: '返金完了確認',
        data: 'refund_confirm:{{REFUND_ID}}'
      }),
      style: 'secondary'
    });

    // Set theme colors
    template.layout.theme.primaryColor = '#10b981';
    template.layout.theme.secondaryColor = '#059669';

    return template;
  }

  static createCustomTemplate(category = 'statement') {
    const template = new FlexTemplate({
      name: this.getDefaultTemplateName(category),
      category: category,
      altText: this.getDefaultAltText(category)
    });

    // Add basic structure based on category
    switch (category) {
      case 'statement':
        template.layout.addPart('header', 'title', {
          text: 'タイトルを入力してください',
          level: 'h2'
        });
        template.layout.addPart('body', 'comment', {
          text: 'メッセージを入力してください',
          multiline: true
        });
        break;

      case 'confirm':
        template.layout.addPart('header', 'title', {
          text: '確認のお願い',
          level: 'h2'
        });
        template.layout.addPart('body', 'comment', {
          text: '確認内容を入力してください',
          multiline: true
        });
        template.layout.addPart('footer', 'reply_button', {
          label: '返信する',
          dataTemplate: 'reply:{{MESSAGE_ID}}'
        });
        break;

      case 'refund':
        template.layout.addPart('header', 'title', {
          text: 'キャンセル・返金通知',
          level: 'h2'
        });
        template.layout.addPart('body', 'comment', {
          text: 'キャンセル・返金の詳細を入力してください',
          multiline: true
        });
        break;

      default:
        template.layout.addPart('body', 'title', {
          text: 'タイトル',
          level: 'h2'
        });
        template.layout.addPart('body', 'comment', {
          text: 'メッセージ内容',
          multiline: true
        });
    }

    return template;
  }

  static getDefaultTemplateName(category) {
    const names = {
      statement: '明細通知テンプレート',
      confirm: '確認メッセージテンプレート',
      refund: 'キャンセル・返金通知テンプレート'
    };
    return names[category] || '新しいテンプレート';
  }

  static getDefaultAltText(category) {
    const altTexts = {
      statement: '明細をお送りします',
      confirm: 'ご確認をお願いします',
      refund: 'キャンセル・返金のお知らせ'
    };
    return altTexts[category] || 'メッセージが届きました';
  }

  static getAllDefaultTemplates() {
    return [
      this.createStatementTemplate(),
      this.createConfirmTemplate(),
      this.createRefundTemplate()
    ];
  }

  static getTemplateByCategory(category) {
    switch (category) {
      case 'statement':
        return this.createStatementTemplate();
      case 'confirm':
        return this.createConfirmTemplate();
      case 'refund':
        return this.createRefundTemplate();
      default:
        return this.createCustomTemplate(category);
    }
  }

  /**
   * Create a sample template with all component types for testing
   */
  static createSampleTemplate() {
    const template = new FlexTemplate({
      name: 'サンプルテンプレート（全コンポーネント）',
      category: 'statement',
      altText: 'サンプルメッセージです'
    });

    // Header
    template.layout.addPart('header', 'date', {
      mode: 'auto',
      format: 'YYYY年MM月DD日'
    });

    template.layout.addPart('header', 'title', {
      text: 'サンプルメッセージ',
      level: 'h1'
    });

    template.layout.addPart('header', 'tag', {
      label: '重要',
      color: '#ef4444',
      size: 'sm'
    });

    // Body
    template.layout.addPart('body', 'teacher', {
      name: 'サンプル先生',
      title: '担当'
    });

    template.layout.addPart('body', 'separator', {
      margin: 'md',
      color: '#e5e7eb'
    });

    template.layout.addPart('body', 'image', {
      url: 'https://via.placeholder.com/300x200',
      aspectRatio: '3:2',
      aspectMode: 'cover',
      backgroundColor: '#f0f0f0'
    });

    template.layout.addPart('body', 'comment', {
      text: 'これはサンプルのコメントです。\n複数行のテキストも表示できます。',
      multiline: true
    });

    template.layout.addPart('body', 'items', {
      items: [
        { name: 'サンプル項目1', amount: 1000, note: '備考1' },
        { name: 'サンプル項目2', amount: 500, note: '備考2' },
        { name: 'サンプル項目3', amount: 300, note: '' }
      ],
      showTotal: true,
      currency: '円'
    });

    template.layout.addPart('body', 'spacer', {
      size: 'lg'
    });

    // Footer
    template.layout.addPart('footer', 'button', {
      label: 'メインボタン',
      action: new ButtonAction({
        type: 'postback',
        label: 'メインボタン',
        data: 'main_action:sample'
      }),
      style: 'primary'
    });

    template.layout.addPart('footer', 'button', {
      label: 'サブボタン',
      action: new ButtonAction({
        type: 'uri',
        label: 'サブボタン',
        uri: 'https://example.com'
      }),
      style: 'secondary'
    });

    template.layout.addPart('footer', 'reply_button', {
      label: '返信する',
      dataTemplate: 'reply:sample'
    });

    return template;
  }

  /**
   * Create minimal template for quick start
   */
  static createMinimalTemplate() {
    const template = new FlexTemplate({
      name: 'シンプルテンプレート',
      category: 'statement',
      altText: 'シンプルなメッセージです'
    });

    template.layout.addPart('body', 'title', {
      text: 'タイトル',
      level: 'h2'
    });

    template.layout.addPart('body', 'comment', {
      text: 'メッセージ内容をここに入力してください。',
      multiline: true
    });

    return template;
  }
}

