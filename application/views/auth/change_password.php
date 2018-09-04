
    <!-- Content Header (Page header) -->
    <section class="content-header">
      <h1>
        <?php echo lang('change_password_heading');?>
        <small></small>
      </h1>
      <ol class="breadcrumb">
        <li><?php echo anchor('dashboard','<i class="fa fa-dashboard"></i> Beranda</a>')?></li>
      </ol>
    </section>
    <!-- Main content -->
    <section class="content">
	<?php if(isset($message)){   
		 echo '<div class="alert alert-warning">  
		   <a href="#" class="close" data-dismiss="alert">&times;</a>  
		   '.$message.'
		 </div> '; 
    }  ?>
      <!-- Default box -->
      <div class="box">
        <div class="box-header">
		 <h3 class="box-title"></h3>
		<hr />	 
		<?php echo form_open("auth/change_password");?>
	    <div class = "form-group">
            <label><?php echo lang('change_password_old_password_label', 'old_password');?> </label>
            <?php echo form_input($old_password);?>
		</div>

		<div class = "form-group">
            <label for="new_password"><?php echo sprintf(lang('change_password_new_password_label'), $min_password_length);?></label>
            <?php echo form_input($new_password);?>
		</div>

		<div class = "form-group">
            <label><?php echo lang('change_password_new_password_confirm_label', 'new_password_confirm');?> </label>
            <?php echo form_input($new_password_confirm);?>
		</div>

		<?php echo form_input($user_id);?>
		<?php echo form_submit('submit', lang('change_password_submit_btn'),array('class'=>'btn btn-primary btn-flat'));?>
	<?php echo form_close();?>
		</div>
	  </div>
               
    </section>
	<!-- /.content -->