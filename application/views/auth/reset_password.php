<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="description" content="<?php if(isset($meta_description)){ echo ucfirst($meta_description);}?>">
  <meta name="keywords" content="<?php if(isset($meta_keywords)){ echo ucfirst($meta_keywords);}?>">
  <meta name="author" content="Andhika Putra Pratama">
  <link rel="icon" href="<?php if(isset($logos)){ echo base_url($logos); }?>"/>
  <title><?php if(isset($web_name)){ echo ucfirst($web_name); }?> | <?php if(isset($title)){ echo ucfirst($title); }?></title>
  <!-- Tell the browser to be responsive to screen width -->
  <meta content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" name="viewport">
  <!-- Bootstrap 3.3.7 -->
  <link rel="stylesheet" href="<?php echo base_url('resources');?>/bower_components/bootstrap/dist/css/bootstrap.min.css">
  <!-- Font Awesome -->
  <link rel="stylesheet" href="<?php echo base_url('resources');?>/bower_components/font-awesome/css/font-awesome.min.css">
  <!-- Ionicons -->
  <link rel="stylesheet" href="<?php echo base_url('resources');?>/bower_components/Ionicons/css/ionicons.min.css">
  <!-- Theme style -->
  <link rel="stylesheet" href="<?php echo base_url('resources');?>/dist/css/AdminLTE.min.css">
  <!-- iCheck -->
  <link rel="stylesheet" href="<?php echo base_url('resources');?>/plugins/iCheck/square/blue.css">

  <!-- HTML5 Shim and Respond.js IE8 support of HTML5 elements and media queries -->
  <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
  <!--[if lt IE 9]>
  <script src="https://oss.maxcdn.com/html5shiv/3.7.3/html5shiv.min.js"></script>
  <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
  <![endif]-->

  <!-- Google Font -->
  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,600,700,300italic,400italic,600italic">
</head>
<body class="hold-transition login-page">
<div class="login-box">
  <div class="login-logo">
    <a href="#"><b><?php echo ucfirst($nama_situs['value']);?></b></a></br>
	<small><?php echo lang('reset_password_heading');?></small> 
  </div>
  <!-- /.login-logo -->
  <div class="login-box-body">
    <p class="login-box-msg"></p>
	<?php if(isset($message)){   
		 echo '<div class="alert alert-warning">  
		   <a href="#" class="close" data-dismiss="alert">&times;</a>  
		   '.$message.'
		 </div> '; 
    }  ?> 
    
	<?php echo form_open('auth/reset_password/' . $code);?>

		<div class = "form-group">
			<label for="new_password"><?php echo sprintf(lang('reset_password_new_password_label'), $min_password_length);?></label>
			<?php echo form_input($new_password);?>
		</div>

		<div class = "form-group">
			<label><?php echo lang('reset_password_new_password_confirm_label', 'new_password_confirm');?> </label>
			<?php echo form_input($new_password_confirm);?>
		</div>

		<?php echo form_input($user_id);?>
		<?php echo form_hidden($csrf); ?>

		<?php echo form_submit('submit', lang('reset_password_submit_btn'),array('class'=>'btn btn-block btn-primary btn-flat'));?>

	<?php echo form_close();?>
	
  </div>
  <!-- /.login-box-body -->
</div>
<!-- /.login-box -->

<!-- jQuery 3 -->
<script src="<?php echo base_url('resources');?>/bower_components/jquery/dist/jquery.min.js"></script>
<!-- Bootstrap 3.3.7 -->
<script src="<?php echo base_url('resources');?>/bower_components/bootstrap/dist/js/bootstrap.min.js"></script>
</body>
</html>